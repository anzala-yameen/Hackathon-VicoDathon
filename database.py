import json
import sqlite3
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.config import settings

DB_FILE = Path("./interview_agent.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        candidate_role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_question_index INTEGER DEFAULT 1,
        total_questions INTEGER DEFAULT 8,
        difficulty TEXT DEFAULT 'Intermediate',
        current_topic_id TEXT,
        current_topic_name TEXT,
        topics_covered TEXT DEFAULT '[]',
        is_completed BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'active'
    )
    """)
    
    # Questions & Answers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS QnA (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        topic_id TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question TEXT NOT NULL,
        candidate_answer TEXT,
        follow_up_context TEXT,
        confidence_score REAL,
        evaluation_notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (session_id)
    )
    """)
    
    # Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        session_id TEXT PRIMARY KEY,
        score INTEGER NOT NULL,
        summary TEXT,
        strengths TEXT,
        weaknesses TEXT,
        topics_to_revise TEXT,
        recommendations TEXT,
        confidence_analysis TEXT,
        topic_mastery TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (session_id)
    )
    """)
    
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn
