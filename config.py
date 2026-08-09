import os
from pathlib import Path

class Settings:
    PROJECT_NAME: str = "AI Interview Agent"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment variables
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_DIR: Path = BASE_DIR / "data"
    CURRICULUM_PATH: Path = DATA_DIR / "curriculum.json"
    CANDIDATE_PATH: Path = DATA_DIR / "candidate.json"
    
    # Database
    DATABASE_URL: str = "sqlite:///./interview_agent.db"

settings = Settings()
