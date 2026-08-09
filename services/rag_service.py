import json
import math
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.config import settings

def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric words."""
    return re.findall(r'\b[a-z0-9]+\b', text.lower())

class LightweightRAG:
    """
    A fast, lightweight, pure-Python RAG Engine that indexes curriculum modules, 
    topics, and learning objectives to provide grounded AI interview questions.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vectors: List[Dict[str, float]] = []
        self.is_indexed = False
        self._load_and_index_curriculum()

    def _load_and_index_curriculum(self):
        if not settings.CURRICULUM_PATH.exists():
            return
            
        with open(settings.CURRICULUM_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        docs = []
        # Index Modules & Topics
        for module in data.get("modules", []):
            module_id = module.get("id")
            module_name = module.get("name")
            category = module.get("category")
            day_range = module.get("dayRange", [1, 1])
            
            # Summary chunk
            summary_text = f"Module {module_id}: {module_name} ({category}, Days {day_range[0]}-{day_range[1]}). Description: {module.get('description', '')}. Objectives: {', '.join(module.get('learningObjectives', []))}. Tools: {', '.join(module.get('tools', []))}"
            docs.append({
                "doc_id": f"{module_id}-summary",
                "module_id": module_id,
                "module_name": module_name,
                "day_range": day_range,
                "category": category,
                "topic_name": module_name,
                "text": summary_text,
                "learning_objectives": module.get("learningObjectives", []),
                "tools": module.get("tools", [])
            })
            
            # Specific topics
            for topic in module.get("topics", []):
                topic_text = f"Topic in {module_name} (Days {day_range[0]}-{day_range[1]}): {topic}. Objectives: {', '.join(module.get('learningObjectives', []))}. Tools: {', '.join(module.get('tools', []))}"
                docs.append({
                    "doc_id": f"{module_id}-{topic[:15]}",
                    "module_id": module_id,
                    "module_name": module_name,
                    "day_range": day_range,
                    "category": category,
                    "topic_name": topic,
                    "text": topic_text,
                    "learning_objectives": module.get("learningObjectives", []),
                    "tools": module.get("tools", [])
                })

        # Index Days (1-31)
        for day_item in data.get("days", []):
            day_num = day_item.get("day")
            day_title = day_item.get("title")
            day_type = day_item.get("type", "BUILD")
            day_tools = day_item.get("tools", [])
            day_objs = day_item.get("objectives", [])
            day_text = f"Day {day_num}: {day_title} [{day_type}]. Tools: {', '.join(day_tools)}. Objectives: {', '.join(day_objs)}"
            docs.append({
                "doc_id": f"day-{day_num}",
                "module_id": f"day-{day_num}",
                "module_name": f"Day {day_num}: {day_title}",
                "day_range": [day_num, day_num],
                "category": day_type,
                "topic_name": day_title,
                "text": day_text,
                "learning_objectives": day_objs,
                "tools": day_tools
            })
                
        self.documents = docs
        if not docs:
            return

        # Build TF-IDF Index
        num_docs = len(docs)
        doc_freqs: Dict[str, int] = {}
        tf_list: List[Dict[str, float]] = []

        for doc in docs:
            tokens = tokenize(doc["text"])
            total_tokens = len(tokens) or 1
            counts: Dict[str, int] = {}
            for t in tokens:
                counts[t] = counts.get(t, 0) + 1
            
            tf = {term: count / total_tokens for term, count in counts.items()}
            tf_list.append(tf)

            for term in counts.keys():
                doc_freqs[term] = doc_freqs.get(term, 0) + 1

        # Calculate IDF
        self.idf = {term: math.log((num_docs + 1) / (df + 1)) + 1 for term, df in doc_freqs.items()}

        # Build Document Vectors
        self.doc_vectors = []
        for tf in tf_list:
            vec = {term: tf_val * self.idf.get(term, 0) for term, tf_val in tf.items()}
            self.doc_vectors.append(vec)

        self.is_indexed = True

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        dot_product = sum(vec1[t] * vec2[t] for t in intersection)
        
        norm1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
        norm2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot_product / (norm1 * norm2)

    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.is_indexed or not query:
            return self.documents[:top_k]

        q_tokens = tokenize(query)
        if not q_tokens:
            return self.documents[:top_k]

        q_total = len(q_tokens)
        q_counts: Dict[str, int] = {}
        for t in q_tokens:
            q_counts[t] = q_counts.get(t, 0) + 1

        query_vec = {t: (cnt / q_total) * self.idf.get(t, 1.0) for t, cnt in q_counts.items()}

        scores = []
        for idx, doc_vec in enumerate(self.doc_vectors):
            sim = self._cosine_similarity(query_vec, doc_vec)
            scores.append((idx, sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        
        results = []
        for idx, sim in scores[:top_k]:
            doc = self.documents[idx].copy()
            doc["score"] = float(sim)
            results.append(doc)
            
        return results

    def get_topic_by_name(self, topic_name: str) -> Optional[Dict[str, Any]]:
        for doc in self.documents:
            if doc["topic_name"].lower() in topic_name.lower() or topic_name.lower() in doc["topic_name"].lower():
                return doc
        return self.documents[0] if self.documents else None

rag_engine = LightweightRAG()
