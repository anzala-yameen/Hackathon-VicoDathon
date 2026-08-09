import json
import logging
import random
from typing import Dict, Any, List, Optional
from config import settings

logger = logging.getLogger(__name__)

# Try importing google-genai
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if HAS_GENAI and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}")

    def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        """
        Calls Gemini API if available, else falls back to intelligent mock generation.
        """
        if self.client:
            try:
                full_prompt = f"{system_prompt}\n\nUSER PROMPT:\n{user_prompt}"
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=full_prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini API error: {e}. Falling back to dynamic agent engine.")
                
        # Dynamic Fallback if API key not present or error occurs
        return self._dynamic_fallback_response(system_prompt, user_prompt)

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Generates JSON structured output.
        """
        raw_text = self.generate_text(system_prompt, user_prompt)
        try:
            # Clean markdown formatting if present
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except Exception as e:
            logger.warning(f"Failed to parse JSON response: {e}. Raw text: {raw_text[:100]}")
            return {}

    def _dynamic_fallback_response(self, system_prompt: str, user_prompt: str) -> str:
        """
        Intelligent fallback generator to ensure full demo functionality even without API key.
        """
        sys_lower = system_prompt.lower()
        user_lower = user_prompt.lower()
        
        # Check if generating feedback report
        if "generate_feedback" in sys_lower or "overall performance score" in user_lower or "evaluate a candidate's technical interview performance" in sys_lower:
            return json.dumps({
                "score": 84,
                "summary": "Demonstrated solid technical understanding of core AI engineering concepts, with impressive answers on RAG architecture and LLM prompting. Needs to refine low-level PyTorch tensor graph mechanics and LoRA fine-tuning math.",
                "strengths": [
                    "Strong conceptual understanding of dense vector search and chunking strategies",
                    "Clear explanation of AsyncIO for scalable LLM batch ingestion",
                    "Good awareness of multi-agent control loops and tool-calling validation"
                ],
                "weaknesses": [
                    "Shallow grasp of HNSW vs IVF-PQ vector indexing performance trade-offs",
                    "Limited experience with Low-Rank Adaptation (LoRA) matrix rank selection",
                    "Did not articulate DPO preference alignment vs PPO reward modeling clearly"
                ],
                "topicsToRevise": [
                    "Vector Indexing Mechanics (HNSW, IVF-PQ)",
                    "Low-Rank Adaptation (LoRA & QLoRA) Mechanics",
                    "RAG Evaluation Frameworks (Ragas, TruLens)"
                ],
                "recommendations": [
                    "Build a hands-on project comparing FAISS HNSW vs Flat indexing search latency at 1M vectors.",
                    "Implement a minimal PyTorch LoRA adapter layer manually without HuggingFace PEFT wrappers.",
                    "Set up an automated Ragas evaluation pipeline for RAG hallucination scoring."
                ],
                "confidenceAnalysis": {
                    "overallConfidencePct": 78,
                    "clarityScore": 85,
                    "depthScore": 75,
                    "notes": "Candidate spoke with strong clarity on higher-level system architecture, but exhibited hesitation when probed on deep mathematical primitives."
                },
                "topicMastery": [
                    {"topic": "Python & Async Systems", "score": 90, "status": "Mastered"},
                    {"topic": "Prompt Engineering & Guardrails", "score": 88, "status": "Mastered"},
                    {"topic": "RAG Systems & Vector DBs", "score": 78, "status": "Developing"},
                    {"topic": "PyTorch & Deep Learning Core", "score": 72, "status": "Developing"},
                    {"topic": "LoRA & Model Fine-Tuning", "score": 60, "status": "Needs Review"}
                ]
            })

        # Check if generating explicit JSON answer evaluation object
        if "evaluate answer accuracy:" in sys_lower:
            return json.dumps({
                "confidence": 0.8,
                "is_accurate": True,
                "feedback": "Solid answer mentioning key concepts.",
                "next_difficulty": "Intermediate"
            })
            
        # Default question fallbacks based on context/topic keywords
        if "hnsw" in user_lower or "vector" in user_lower or "indexing" in user_lower:
            return "Welcome! In vector search systems, could you explain the key architectural difference between HNSW vector indexing and IVF-PQ indexing, and when you would select one over the other?"
        elif "agent" in user_lower or "tool" in user_lower or "mcp" in user_lower:
            return "Moving to Autonomous Agents: When building multi-agent systems, how do you manage state graph cycles to prevent infinite tool calling loops while handling runtime failure recovery?"
        elif "lora" in user_lower or "fine-tuning" in user_lower or "peft" in user_lower:
            return "Let's explore Model Fine-Tuning: In Low-Rank Adaptation (LoRA), why do we freeze the pre-trained weight matrix W0 and only train decomposition matrices A and B? How does rank parameter 'r' impact VRAM footprint?"
        elif "pytorch" in user_lower or "autograd" in user_lower:
            return "Let's dive into PyTorch internals: When writing custom PyTorch nn.Module architectures, why is it critical to use torch.no_grad() during validation, and how does autograd track backpropagation?"
        elif "prompt" in user_lower or "guardrails" in user_lower:
            return "Regarding Prompt Engineering & Safety: How do you design structured system prompts and output guardrails to prevent prompt injection and ensure deterministic Pydantic JSON responses?"
        else:
            return "Building on AI system design: How would you architect a hybrid search engine combining BM25 sparse keyword matching with dense vector embeddings using Reciprocal Rank Fusion (RRF) in production?"

llm_service = LLMService()
