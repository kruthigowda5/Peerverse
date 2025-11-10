# 🎓 Peerverse – Peer Learning Platform

**Peerverse** is a full-stack web app that connects mentors and learners for micro-learning sessions.  
Mentors can upload videos, while learners explore content, earn badges, and get AI-powered skill recommendations.

---

## ⚙️ Tech Stack
- **Frontend:** Next.js • TypeScript • Tailwind CSS • shadcn/ui  
- **Backend:** Django REST Framework  
- **Database:** PostgreSQL / SQLite  
- **Auth:** JWT + Google OAuth  
- **AI:** FastAPI (cosine similarity for recommendations)

---

## 🚀 Features
- 👥 Separate dashboards for Mentors & Learners  
- 🎥 Mentor video uploads  
- 🧠 AI-based skill recommendations  
- 🏅 Badges and gamification  
- 🔒 Secure authentication  
- 💬 (Coming soon) Comments, chat & live sessions

---

## File Structure
frontend/ → Next.js frontend
backend/ → Django REST API
ai_service/ → FastAPI microservice
docs/ → Setup notes

yaml
Copy code

---

##  Quickstart
```bash
git clone https://github.com/kruthigowda5/Peerverse.git
cd Peerverse
cp .env.example .env
docker compose up -d db
🧑‍💻 Developer
Developed by: Kruthi Gowda

⭐ Project under active development — new features coming soon!
