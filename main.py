import os
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import init_db, get_db
from app.models.schemas import (
    StartInterviewRequest,
    StartInterviewResponse,
    RespondInterviewRequest,
    RespondInterviewResponse,
    FeedbackResponse,
    InterviewApiRequest
)
from app.services.interview_agent import agent_orchestrator, load_candidates, load_curriculum
from app.services.feedback_service import feedback_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_interview_agent")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous AI Interviewer conducting personalized technical interviews based on learning journeys."
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("SQLite database initialized successfully.")

def get_frontend_dist():
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
        os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
        os.path.abspath(os.path.join(os.getcwd(), "dist")),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

frontend_dist = get_frontend_dist()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/")
def read_root():
    if frontend_dist:
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }



# --- Core Interview API Endpoints ---

@app.post("/api/interview")
def unified_interview_endpoint(payload: InterviewApiRequest):
    """
    POST /api/interview
    Main interview endpoint adhering strictly to technical-spec.md:
    1. Start interview: { "sessionId": "abc-123", "candidate": { ... } }
    2. Conversation turn: { "sessionId": "abc-123", "message": "..." }
    """
    try:
        action = (payload.action or "").lower()
        cand_input = payload.candidate or payload.candidateId or "CAND-001"
        user_text = payload.message or payload.answer
        
        # Conversation Turn
        if payload.sessionId and user_text:
            return agent_orchestrator.process_response(payload.sessionId, user_text)
            
        # Start Interview
        if action == "start" or payload.candidate or payload.candidateId or (payload.sessionId and not user_text):
            return agent_orchestrator.start_interview(cand_input, custom_session_id=payload.sessionId)
            
        if action == "feedback" and payload.sessionId:
            return feedback_service.generate_feedback(payload.sessionId)
            
        # Default fallback start
        return agent_orchestrator.start_interview(cand_input, custom_session_id=payload.sessionId)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /api/interview endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interview action failed: {str(e)}"
        )

@app.post("/api/interview/start", response_model=StartInterviewResponse)
def start_interview(payload: StartInterviewRequest):
    """
    POST /api/interview/start
    Starts a new personalized interview session for a given candidateId.
    """
    try:
        res = agent_orchestrator.start_interview(payload.candidateId)
        return res
    except Exception as e:
        logger.error(f"Error starting interview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start interview: {str(e)}"
        )

@app.post("/api/interview/respond", response_model=RespondInterviewResponse)
def respond_interview(payload: RespondInterviewRequest):
    """
    POST /api/interview/respond
    Submits candidate's answer to current question, processes evaluation, and returns next question.
    """
    try:
        res = agent_orchestrator.process_response(payload.sessionId, payload.answer)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error processing interview response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process response: {str(e)}"
        )

@app.get("/api/interview/feedback/{sessionId}", response_model=FeedbackResponse)
def get_interview_feedback(sessionId: str):
    """
    GET /api/interview/feedback/{sessionId}
    Generates and returns final structured feedback evaluation report.
    """
    try:
        res = feedback_service.generate_feedback(sessionId)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error generating feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate feedback: {str(e)}"
        )

# --- Additional Data & Helper Endpoints ---

@app.get("/api/candidates")
def get_candidates():
    """
    Returns list of candidate profiles for switching candidate context in UI.
    """
    return {"candidates": load_candidates()}

@app.get("/api/curriculum")
def get_curriculum():
    """
    Returns the AI Cohort Curriculum modules and topics.
    """
    return load_curriculum()

@app.get("/api/interview/session/{sessionId}")
def get_session_info(sessionId: str):
    """
    Returns current session status and QnA transcript history.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (sessionId,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
        
    cursor.execute("SELECT * FROM QnA WHERE session_id = ? ORDER BY question_number ASC", (sessionId,))
    qnas = [dict(q) for q in cursor.fetchall()]
    conn.close()
    
    return {
        "session": dict(session),
        "transcript": qnas
    }

# --- Production Static File Serving for React Frontend ---
if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index not found")


