from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Peerverse AI Service", version="0.1.0")

class UserProfile(BaseModel):
    id: str
    skills_known: List[str] = []
    skills_to_learn: List[str] = []

class SkillQuery(BaseModel):
    users: List[UserProfile]
    target_skill: str
    top_k: int = 5

class Recommendation(BaseModel):
    user_id: str
    score: float

class SkillRecResponse(BaseModel):
    mentors: List[Recommendation]
    next_skills: List[str]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend", response_model=SkillRecResponse)
def recommend(data: SkillQuery):
    corpus = [" ".join(u.skills_known) for u in data.users]
    if not corpus:
        return {"mentors": [], "next_skills": []}

    vectorizer = TfidfVectorizer(lowercase=True)
    X = vectorizer.fit_transform(corpus + [data.target_skill])
    sim = cosine_similarity(X[-1], X[:-1]).flatten()

    top_idx = np.argsort(sim)[::-1][: data.top_k]
    mentors = [
        {"user_id": data.users[i].id, "score": float(sim[i])}
        for i in top_idx if sim[i] > 0
    ]

    # Next skills = most frequent tokens in mentors beyond target term
    feature_names = np.array(vectorizer.get_feature_names_out())
    mentor_vecs = X[top_idx]
    avg_weights = mentor_vecs.mean(axis=0).A1
    top_terms_idx = np.argsort(avg_weights)[::-1][:10]
    candidate_terms = feature_names[top_terms_idx]
    next_skills = [t for t in candidate_terms if t.lower() not in data.target_skill.lower().split()][:5]

    return {"mentors": mentors, "next_skills": next_skills}
