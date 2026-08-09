from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Request Schemas ---

class StartInterviewRequest(BaseModel):
    candidateId: str = Field(..., example="123")

class RespondInterviewRequest(BaseModel):
    sessionId: str = Field(..., example="abc123")
    answer: str = Field(..., example="I use dot product distance when embeddings are normalized.")

class InterviewApiRequest(BaseModel):
    candidateId: Optional[str] = Field(None, example="CAND-001")
    candidate: Optional[Dict[str, Any]] = Field(None, example={"member": {"id": "CAND-001", "name": "Sarah Johnson"}})
    sessionId: Optional[str] = Field(None, example="session_123")
    message: Optional[str] = Field(None, example="I use cosine similarity for vector comparison.")
    answer: Optional[str] = Field(None, example="I use cosine similarity for vector comparison.")
    action: Optional[str] = Field(None, example="start")

# --- Response Schemas ---

class StartInterviewResponse(BaseModel):
    sessionId: str
    firstQuestion: str
    questionNumber: int = 1
    totalQuestions: int = 8
    candidateName: str
    candidateRole: str
    currentTopic: str
    currentDifficulty: str

class RespondInterviewResponse(BaseModel):
    sessionId: str
    questionNumber: int
    totalQuestions: int = 8
    nextQuestion: Optional[str] = None
    isComplete: bool = False
    currentTopic: Optional[str] = None
    currentDifficulty: Optional[str] = None
    evaluation: Optional[Dict[str, Any]] = None

class ConfidenceBreakdown(BaseModel):
    overallConfidencePct: int
    clarityScore: int
    depthScore: int
    notes: str

class TopicMasteryItem(BaseModel):
    topic: str
    score: int
    status: str # "Mastered", "Developing", "Needs Review"

class FeedbackResponse(BaseModel):
    sessionId: str
    candidateId: str
    candidateName: str
    score: int
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    topicsToRevise: List[str]
    recommendations: List[str]
    confidenceAnalysis: Dict[str, Any]
    topicMastery: List[Dict[str, Any]]
    transcript: Optional[List[Dict[str, Any]]] = None

class CandidateProfile(BaseModel):
    candidateId: str
    name: str
    email: str
    targetRole: str
    experienceLevel: str
    avatarUrl: str
    completedTopics: List[str]
    skippedTopics: List[str]
    weakTopics: List[str]
    learningJourney: Dict[str, Any]
