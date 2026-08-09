import json
import uuid
import sqlite3
import logging
from typing import Dict, Any, List, Optional, Union
from config import settings
from database import get_db
from services.rag_service import rag_engine
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

# Try importing LangGraph / LangChain for Agent State Representation
try:
    from langgraph.graph import StateGraph, START, END
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False

def load_candidates() -> List[Dict[str, Any]]:
    if not settings.CANDIDATE_PATH.exists():
        return []
    with open(settings.CANDIDATE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    raw_list = data.get("candidates", [])
    return [normalize_candidate(c) for c in raw_list]

def get_candidate_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    candidates = load_candidates()
    target = str(candidate_id).strip().upper()
    
    # 1. Exact match
    for c in candidates:
        cand_id = c.get("candidateId") or c.get("member", {}).get("id", "")
        if str(cand_id).upper() == target:
            return c
            
    # 2. Number string match e.g. "1" -> CAND-001, "123" -> CAND-001 fallback
    if target.isdigit():
        num = int(target)
        if 1 <= num <= len(candidates):
            return candidates[num - 1]
            
    # 3. Partial match (e.g., "CAND-001")
    for c in candidates:
        cand_id = c.get("candidateId") or c.get("member", {}).get("id", "")
        if target in str(cand_id).upper() or str(cand_id).upper() in target:
            return c
            
    return candidates[0] if candidates else None

def normalize_candidate(candidate_input: Any) -> Dict[str, Any]:
    """
    Normalizes candidate input into a unified candidate dictionary format 
    supporting both candidate.json schemas (member/missions/signals and candidateId/topics).
    """
    if isinstance(candidate_input, dict):
        if "member" in candidate_input:
            mem = candidate_input.get("member", {})
            cand_id = mem.get("id", "CAND-001")
            name = mem.get("name", "Candidate")
            role = mem.get("jobRole", "AI Engineer")
            exp_years = mem.get("yearsExperience", 3)
            edu = mem.get("education", "")
            exp_str = f"{exp_years} yrs exp ({edu})"
            
            missions = candidate_input.get("missions", [])
            signals = candidate_input.get("signals", {})
            
            completed_topics = []
            skipped_topics = []
            weak_topics = []
            
            for m in missions:
                title = m.get("title", "")
                if m.get("skipped"):
                    skipped_topics.append(title)
                elif m.get("passed"):
                    completed_topics.append(title)
                    if m.get("attempts", 1) > 1:
                        weak_topics.append(title)
                else:
                    weak_topics.append(title)

            avatar_urls = [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
            ]
            num_id = int(''.join(filter(str.isdigit, cand_id)) or "1")
            avatar_url = avatar_urls[(num_id - 1) % len(avatar_urls)]

            missions_completed = signals.get("missionsCompleted", len(completed_topics))
            missions_first_try = signals.get("missionsFirstTry", max(1, len(completed_topics) - len(weak_topics)))
            progress_pct = min(100, int((missions_completed / 31.0) * 100))
                    
            return {
                "candidateId": cand_id,
                "name": name,
                "targetRole": role,
                "experienceLevel": exp_str,
                "avatarUrl": candidate_input.get("avatarUrl", avatar_url),
                "completedTopics": completed_topics,
                "skippedTopics": skipped_topics,
                "weakTopics": weak_topics,
                "learningJourney": {
                    "missionsCompleted": missions_completed,
                    "missionsFirstTry": missions_first_try,
                    "commitDays": signals.get("commitDays", 25),
                    "overallProgressPct": progress_pct
                },
                "member": mem,
                "missions": missions,
                "signals": signals
            }
        return candidate_input
    elif isinstance(candidate_input, str):
        c = get_candidate_by_id(candidate_input)
        if c:
            return normalize_candidate(c)
        return {
            "candidateId": candidate_input,
            "name": f"Candidate {candidate_input}",
            "targetRole": "AI Engineer",
            "experienceLevel": "Mid-Level",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "completedTopics": [],
            "skippedTopics": [],
            "weakTopics": ["Vector Indexing Mechanics (HNSW, IVF-PQ)"],
            "learningJourney": {"missionsCompleted": 20, "missionsFirstTry": 15, "overallProgressPct": 70}
        }
    return {
        "candidateId": "CAND-001",
        "name": "Sarah Johnson",
        "targetRole": "Senior Data Engineer",
        "experienceLevel": "9 yrs exp (MS Computer Science)",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "completedTopics": ["Embeddings Explained", "Vector Databases Overview"],
        "skippedTopics": ["Monitoring, Logging & Observability"],
        "weakTopics": ["Retrieval & Matching Engine", "Prompt Engineering Fundamentals"],
        "learningJourney": {"missionsCompleted": 30, "missionsFirstTry": 20, "overallProgressPct": 90}
    }

def load_curriculum() -> Dict[str, Any]:
    if not settings.CURRICULUM_PATH.exists():
        return {"modules": [], "days": []}
    with open(settings.CURRICULUM_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def analyze_candidate_journey(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes candidate learning history, completed missions, skipped topics, 
    first-try attempts, and experience level to craft a personalized evaluation plan.
    """
    exp_str = str(candidate.get("experienceLevel", "")).lower()
    target_role = str(candidate.get("targetRole", "AI Engineer")).lower()
    journey = candidate.get("learningJourney", {})
    
    missions_completed = journey.get("missionsCompleted", 0)
    missions_first_try = journey.get("missionsFirstTry", 0)
    first_try_rate = (missions_first_try / max(1, missions_completed)) if missions_completed > 0 else 0.5
    
    # Determine initial starting difficulty based on experience & attempt history
    is_senior = any(title in target_role or title in exp_str for title in ["senior", "principal", "distinguished", "architect", "lead", "10 yrs", "15 yrs", "20 yrs", "28 yrs"])
    is_entry = any(title in target_role or title in exp_str for title in ["intern", "junior", "0 yrs", "1 yr", "bootcamp"])
    
    if is_senior:
        initial_difficulty = "Advanced" if first_try_rate >= 0.7 else "Intermediate"
    elif is_entry:
        initial_difficulty = "Beginner" if first_try_rate < 0.6 else "Intermediate"
    else:
        initial_difficulty = "Intermediate"
        
    weak_topics = candidate.get("weakTopics", [])
    skipped_topics = candidate.get("skippedTopics", [])
    completed_topics = candidate.get("completedTopics", [])
    
    # Priority Queue of topics for evaluation:
    # 1. Weak topics (identify technical gaps)
    # 2. Skipped topics (untested curriculum areas)
    # 3. Completed topics (verify true mastery)
    topic_queue = []
    for t in weak_topics + skipped_topics + completed_topics:
        if t and t not in topic_queue:
            topic_queue.append(t)
            
    # Add general curriculum topics if queue is short
    curriculum = load_curriculum()
    for mod in curriculum.get("modules", []):
        for topic in mod.get("topics", []):
            if topic not in topic_queue:
                topic_queue.append(topic)
                
    return {
        "initialDifficulty": initial_difficulty,
        "firstTryRate": round(first_try_rate * 100, 1),
        "missionsCompleted": missions_completed,
        "missionsFirstTry": missions_first_try,
        "topicQueue": topic_queue,
        "weakTopics": weak_topics,
        "skippedTopics": skipped_topics,
        "completedTopics": completed_topics
    }

class InterviewAgentOrchestrator:
    """
    Stateful Agent Orchestrator managing multi-turn technical interviews:
    - Maintains conversation memory using sessionId
    - Asks at least 8 questions spanning multiple curriculum days/modules
    - Performs RAG retrieval over official AI Cohort curriculum
    - Adapts difficulty dynamically (Beginner <-> Intermediate <-> Advanced)
    - Generates adaptive questions and intelligent follow-ups
    """
    
    TOTAL_QUESTIONS = 8
    
    def start_interview(self, candidate_input: Any, custom_session_id: Optional[str] = None) -> Dict[str, Any]:
        candidate = normalize_candidate(candidate_input)
        analysis = analyze_candidate_journey(candidate)
        session_id = custom_session_id or f"session_{uuid.uuid4().hex[:8]}"
        
        # Pick initial topic from priority queue
        initial_topic_name = analysis["topicQueue"][0] if analysis["topicQueue"] else "Vector Indexing Mechanics (HNSW, IVF-PQ)"
        initial_difficulty = analysis["initialDifficulty"]
        
        # Perform RAG Retrieval to ground initial question
        rag_context = rag_engine.retrieve_context(initial_topic_name, top_k=2)
        context_str = "\n".join([f"- {c['text']}" for c in rag_context]) if rag_context else ""
        
        # Generate initial question via LLM / Agent persona
        system_prompt = f"""
You are an expert Senior AI Architect conducting an adaptive technical interview for a candidate applying for: {candidate.get('targetRole', 'AI Engineer')}.
Candidate Profile:
- Name: {candidate.get('name')}
- Experience: {candidate.get('experienceLevel')}
- First-Try Mission Pass Rate: {analysis['firstTryRate']}%
- Weak Topics to Probe: {', '.join(analysis['weakTopics'])}
- Skipped Topics: {', '.join(analysis['skippedTopics'])}

Your Goal:
Generate Question #1 of {self.TOTAL_QUESTIONS}.
1. Start with a brief warm welcome (1 concise sentence).
2. Ask a clear, practical technical question on candidate priority topic: "{initial_topic_name}".
3. Target Difficulty: {initial_difficulty}.
4. Ground your question using this official curriculum knowledge:
{context_str}
        """.strip()
        
        user_prompt = f"Generate Question #1 for {candidate.get('name')} on topic: {initial_topic_name} at {initial_difficulty} level."
        
        first_question = llm_service.generate_text(system_prompt, user_prompt)
        if not first_question or len(first_question) < 15:
            first_question = f"Welcome {candidate.get('name')}! In vector search systems, could you explain the key architectural difference between HNSW vector indexing and IVF-PQ indexing, and when you would select one over the other?"
            
        # Save session state to SQLite DB
        conn = get_db()
        cursor = conn.cursor()
        
        topics_covered = [initial_topic_name]
        
        cursor.execute("""
            INSERT INTO sessions 
            (session_id, candidate_id, candidate_name, candidate_role, current_question_index, total_questions, difficulty, current_topic_name, topics_covered, is_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            session_id,
            candidate["candidateId"],
            candidate["name"],
            candidate.get("targetRole", "AI Engineer"),
            1,
            self.TOTAL_QUESTIONS,
            initial_difficulty,
            initial_topic_name,
            json.dumps(topics_covered)
        ))
        
        # Save Question #1 to QnA transcript
        cursor.execute("""
            INSERT INTO QnA (session_id, question_number, topic_id, topic_name, difficulty, question)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            1,
            "mod-1",
            initial_topic_name,
            initial_difficulty,
            first_question
        ))
        
        conn.commit()
        conn.close()
        
        # Satisfies BOTH official technical specification contract and React UI contract
        return {
            "reply": first_question,
            "done": False,
            "sessionId": session_id,
            "firstQuestion": first_question,
            "questionNumber": 1,
            "totalQuestions": self.TOTAL_QUESTIONS,
            "candidateName": candidate["name"],
            "candidateRole": candidate.get("targetRole", "AI Engineer"),
            "currentTopic": initial_topic_name,
            "currentDifficulty": initial_difficulty
        }

    def process_response(self, session_id: str, candidate_answer: str) -> Dict[str, Any]:
        from app.services.feedback_service import feedback_service
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
        session = cursor.fetchone()
        
        if not session:
            conn.close()
            raise ValueError(f"Session {session_id} not found")
            
        current_idx = session["current_question_index"]
        candidate_id = session["candidate_id"]
        candidate = normalize_candidate(candidate_id)
        
        analysis = analyze_candidate_journey(candidate)
        
        # Record candidate's answer for current question
        cursor.execute("""
            UPDATE QnA 
            SET candidate_answer = ? 
            WHERE session_id = ? AND question_number = ?
        """, (candidate_answer, session_id, current_idx))
        
        # Check if 8 questions completed
        if current_idx >= self.TOTAL_QUESTIONS:
            cursor.execute("""
                UPDATE sessions 
                SET is_completed = 1, status = 'completed'
                WHERE session_id = ?
            """, (session_id,))
            conn.commit()
            conn.close()
            
            # Generate structured feedback report matching spec
            feedback_data = feedback_service.generate_feedback(session_id)
            
            return {
                "reply": "Interview completed. Thank you for participating in the technical evaluation!",
                "done": True,
                "feedback": {
                    "summary": feedback_data.get("summary", ""),
                    "strengths": feedback_data.get("strengths", []),
                    "gaps": feedback_data.get("gaps", feedback_data.get("weaknesses", [])),
                    "next": feedback_data.get("next", feedback_data.get("recommendations", []))
                },
                "sessionId": session_id,
                "questionNumber": current_idx,
                "totalQuestions": self.TOTAL_QUESTIONS,
                "nextQuestion": None,
                "isComplete": True,
                "currentTopic": session["current_topic_name"],
                "currentDifficulty": session["difficulty"]
            }
            
        next_question_number = current_idx + 1
        topics_covered = json.loads(session["topics_covered"] or "[]")
        
        # Fetch previous QnA transcript for context memory
        cursor.execute("SELECT question_number, question, candidate_answer, topic_name, difficulty FROM QnA WHERE session_id = ? ORDER BY question_number ASC", (session_id,))
        qna_history = cursor.fetchall()
        
        history_summary = []
        for q in qna_history:
            ans = q['candidate_answer'] or 'No answer provided'
            history_summary.append(f"Q{q['question_number']} ({q['topic_name']} - {q['difficulty']}): {q['question']}\nCandidate Answer: {ans}")
        history_text = "\n---\n".join(history_summary)
        
        # --- Dynamic Difficulty Adaptation ---
        ans_clean = candidate_answer.strip()
        ans_len = len(ans_clean)
        current_diff = session["difficulty"]
        
        # Check depth signals: technical terms, conjunctions, explanation length
        domain_keywords = ["because", "however", "architecture", "tradeoff", "latency", "memory", "quantization", "embedding", "vector", "layer", "gradient", "token", "async", "cache", "eval", "loss"]
        keyword_hits = sum(1 for kw in domain_keywords if kw in ans_clean.lower())
        
        if ans_len > 140 and keyword_hits >= 2:
            # High-quality technical answer -> Increase difficulty
            next_difficulty = "Advanced" if current_diff in ["Beginner", "Intermediate"] else "Advanced"
        elif ans_len < 45 or "don't know" in ans_clean.lower() or "not sure" in ans_clean.lower():
            # Weak or missing answer -> Reduce difficulty or guide candidate
            next_difficulty = "Beginner" if current_diff == "Intermediate" else "Intermediate" if current_diff == "Advanced" else "Beginner"
        else:
            # Moderate answer -> Keep difficulty stable
            next_difficulty = current_diff

        # --- Topic Progression across curriculum days/modules ---
        next_topic = None
        for topic in analysis["topicQueue"]:
            if topic not in topics_covered:
                next_topic = topic
                break
                
        if not next_topic:
            # Fallback to curriculum module topics
            curriculum_data = load_curriculum()
            all_topics = []
            for mod in curriculum_data.get("modules", []):
                all_topics.extend(mod.get("topics", []))
            for topic in all_topics:
                if topic not in topics_covered:
                    next_topic = topic
                    break
                    
        if not next_topic:
            next_topic = f"Advanced AI Architecture & Deployment (Turn {next_question_number})"
            
        topics_covered.append(next_topic)
        
        # --- Grounding via RAG retrieval ---
        rag_context = rag_engine.retrieve_context(next_topic, top_k=2)
        rag_str = "\n".join([f"- {c['text']}" for c in rag_context]) if rag_context else ""
        
        # --- LLM / Agent Question Generation ---
        last_qna = qna_history[-1]
        system_prompt = f"""
You are an expert AI Technical Interviewer conducting Question #{next_question_number} of {self.TOTAL_QUESTIONS}.
Candidate Name: {session['candidate_name']}
Target Difficulty: {next_difficulty}
Target Topic: {next_topic}

Candidate's Previous Answer to Q#{last_qna['question_number']}:
"{candidate_answer}"

Full Transcript Context History:
{history_text}

Instructions:
1. Provide a brief 1-sentence reaction/follow-up to the candidate's last answer (e.g. acknowledging an accurate insight or pointing out a missing aspect).
2. Seamlessly transition into Question #{next_question_number} focusing on "{next_topic}" at {next_difficulty} level.
3. Ground your question in this curriculum objective context:
{rag_str}
4. Maintain a professional, supportive, and grounded tone. Do NOT re-introduce yourself.
        """.strip()
        
        user_prompt = f"Generate Question #{next_question_number} on '{next_topic}' at {next_difficulty} level."
        next_question = llm_service.generate_text(system_prompt, user_prompt)
        
        if not next_question or len(next_question) < 15:
            next_question = llm_service._dynamic_fallback_response(system_prompt, next_topic)
            
        # Update session record
        cursor.execute("""
            UPDATE sessions 
            SET current_question_index = ?, difficulty = ?, current_topic_name = ?, topics_covered = ?
            WHERE session_id = ?
        """, (
            next_question_number,
            next_difficulty,
            next_topic,
            json.dumps(topics_covered),
            session_id
        ))
        
        # Insert Next QnA
        cursor.execute("""
            INSERT INTO QnA (session_id, question_number, topic_id, topic_name, difficulty, question)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            next_question_number,
            f"mod-{next_question_number}",
            next_topic,
            next_difficulty,
            next_question
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "reply": next_question,
            "done": False,
            "sessionId": session_id,
            "questionNumber": next_question_number,
            "totalQuestions": self.TOTAL_QUESTIONS,
            "nextQuestion": next_question,
            "isComplete": False,
            "currentTopic": next_topic,
            "currentDifficulty": next_difficulty
        }

agent_orchestrator = InterviewAgentOrchestrator()
