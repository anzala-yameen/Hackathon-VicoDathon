# AI Interview Agent ⚡

An autonomous AI interviewer that conducts personalized, grounded technical interviews based on a candidate's learning journey in an AI engineering cohort.

Built with **FastAPI**, **React + Vite**, **Tailwind CSS**, **Google Gemini AI SDK**, and a **Lightweight RAG Pipeline** over curriculum knowledge.

---

## 🌟 Key Features

1. **Personalized Interview Planning**
   - Ingests candidate profile (`candidate.json`) and AI cohort curriculum (`curriculum.json`).
   - Analyzes completed, skipped, and weak topics to craft tailored evaluation journeys.

2. **Conversational Multi-Turn AI Interviewer**
   - Conducts an 8-question technical interview across at least 4 curriculum topics/days.
   - Generates intelligent, context-aware follow-up questions.
   - Dynamically adapts difficulty (Beginner -> Intermediate -> Advanced) based on response depth.

3. **Lightweight RAG Engine**
   - Indexes 8 AI Engineering modules (Vector search, PyTorch autograd, LLMs, Agents, LoRA, Safety & MLOps).
   - Retrieves relevant context chunks to ground AI interviewer questions in official course objectives.

4. **Comprehensive Feedback Dashboard**
   - Circular score gauge with confetti celebration.
   - Technical strengths and identified knowledge gaps cards.
   - Skill surface radar chart and topic mastery status (Mastered, Developing, Needs Review).
   - Step-by-step personalized learning roadmap.
   - Full interview transcript reader.

5. **Demo-Ready Features**
   - Web Speech API integration for candidate voice input dictation.
   - One-click judge quick response shortcuts.
   - Zero-crash offline dynamic agent fallback when API key is omitted.

---

## 🏗️ Architecture & Folder Structure

```
hackathone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app & REST endpoints
│   │   ├── config.py               # Settings & environment variables
│   │   ├── database.py             # SQLite setup for session state & transcripts
│   │   ├── models/
│   │   │   ├── schemas.py          # Pydantic request/response schemas
│   │   │   └── db_models.py
│   │   ├── services/
│   │   │   ├── rag_service.py      # TF-IDF & Cosine RAG curriculum retriever
│   │   │   ├── llm_service.py      # Gemini AI SDK & dynamic fallback generator
│   │   │   ├── interview_agent.py  # Multi-turn agent state orchestrator
│   │   │   └── feedback_service.py # Post-interview evaluation engine
│   │   └── data/
│   │       ├── curriculum.json     # 8 AI Engineering cohort modules
│   │       └── candidate.json      # Sample candidate profiles & weak topics
│   ├── requirements.txt            # Python backend dependencies
│   └── .env.example
├── frontend/
│   ├── index.html                  # App HTML shell with custom fonts
│   ├── package.json                # React dependencies
│   ├── vite.config.js              # Vite server & API proxy configuration
│   ├── tailwind.config.js          # Tailwind CSS theme & glassmorphism system
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Screen router & modal container
│       ├── index.css               # Glassmorphic utilities & animations
│       ├── services/
│       │   └── api.js              # Axios API client
│       ├── context/
│       │   └── InterviewContext.jsx # Central state management
│       └── components/
│           ├── Navbar.jsx          # Header with candidate selector & brand logo
│           ├── LandingPage.jsx     # SaaS Hero, feature highlights & candidate inspector
│           ├── InterviewRoom.jsx   # Real-time chat room, timer, difficulty & progress bar
│           ├── FeedbackDashboard.jsx # Score gauge, strengths/weaknesses, radar chart & roadmap
│           └── CandidateModal.jsx  # Candidate switching modal
├── README.md                       # Complete project documentation & setup commands
└── PROMPTS.md                      # Detailed prompt engineering documentation
```

---

## 📡 REST API Documentation

### 1. Start Interview
**`POST /api/interview/start`**

**Request:**
```json
{
  "candidateId": "123"
}
```

**Response:**
```json
{
  "sessionId": "session_a1b2c3d4",
  "firstQuestion": "Welcome Alex! In vector databases, could you explain the key architectural difference between HNSW vector indexing and IVF-PQ indexing?",
  "questionNumber": 1,
  "totalQuestions": 8,
  "candidateName": "Alex Rivera",
  "candidateRole": "Junior AI Engineer",
  "currentTopic": "Vector Indexing Mechanics (HNSW, IVF-PQ)",
  "currentDifficulty": "Intermediate"
}
```

### 2. Submit Response & Get Next Question
**`POST /api/interview/respond`**

**Request:**
```json
{
  "sessionId": "session_a1b2c3d4",
  "answer": "HNSW uses graph hierarchy layers for search, while IVF-PQ uses quantization codes to save VRAM."
}
```

**Response:**
```json
{
  "sessionId": "session_a1b2c3d4",
  "questionNumber": 2,
  "totalQuestions": 8,
  "nextQuestion": "Great point on vector compression. Moving to Autonomous Agents: How do you handle state graph cycles to prevent infinite tool calling loops?",
  "isComplete": false,
  "currentTopic": "Agent Control Loops & Tool Use / Function Calling",
  "currentDifficulty": "Intermediate"
}
```

### 3. Fetch Final Feedback Report
**`GET /api/interview/feedback/{sessionId}`**

**Response:**
```json
{
  "sessionId": "session_a1b2c3d4",
  "candidateId": "123",
  "candidateName": "Alex Rivera",
  "score": 84,
  "summary": "Demonstrated solid technical understanding of core AI engineering concepts...",
  "strengths": [
    "Strong conceptual understanding of dense vector search",
    "Clear explanation of AsyncIO for scalable LLM batch ingestion"
  ],
  "weaknesses": [
    "Shallow grasp of HNSW vs IVF-PQ indexing performance trade-offs"
  ],
  "topicsToRevise": [
    "Vector Indexing Mechanics (HNSW, IVF-PQ)",
    "Low-Rank Adaptation (LoRA & QLoRA) Mechanics"
  ],
  "recommendations": [
    "Build a hands-on project comparing FAISS HNSW vs Flat indexing search latency."
  ],
  "confidenceAnalysis": {
    "overallConfidencePct": 78,
    "clarityScore": 85,
    "depthScore": 75,
    "notes": "Spoke with strong clarity on higher-level system architecture."
  },
  "topicMastery": [
    { "topic": "Python & Async Systems", "score": 90, "status": "Mastered" },
    { "topic": "RAG Systems & Vector DBs", "score": 78, "status": "Developing" }
  ]
}
```

---

## 🛠️ Step-by-Step Setup & Execution Commands

### Prerequisites
- Python 3.9+
- Node.js 18+ & npm

### Option 1: Quick PowerShell / Windows Setup

#### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# (Optional) Set Google Gemini API Key
$env:GEMINI_API_KEY="your_gemini_api_key_here"

# Launch FastAPI server on http://localhost:8000
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (in a new terminal tab)
```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server on http://localhost:3000
npm run dev
```

Open your browser and visit: **`http://localhost:3000`**

---

### Option 2: Linux / macOS Setup

#### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Export Gemini Key
export GEMINI_API_KEY="your_gemini_api_key_here"

uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification Walkthrough

1. Open `http://localhost:3000` on your browser.
2. Select a candidate profile (e.g., Alex Rivera, Sarah Chen, or Marcus Vance).
3. Click **Start Interview for Candidate**.
4. Answer technical questions across 8 turns (or click quick demo response shortcuts).
5. Watch the dynamic difficulty gauge adapt between Beginner, Intermediate, and Advanced.
6. Upon question #8 completion, inspect the post-interview **Feedback Dashboard** featuring score gauge, topic mastery radar chart, confidence breakdown, and personalized roadmap!
