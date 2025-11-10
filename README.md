# Peerverse – Peer Learning Platform

**Peerverse** is a full-stack web app that connects mentors and learners for micro-learning sessions.  
Mentors can upload videos, while learners explore content, earn badges, and get AI-powered skill recommendations.

- Frontend: Next.js + Tailwind CSS
- Backend: Django REST Framework + PostgreSQL
- Auth: JWT + Google OAuth
- Realtime: WebRTC/Zoom integration (planned)
- AI: FastAPI microservice (cosine similarity)
- Deploy: Vercel (frontend) + Render (backend)

## Quickstart

1) Copy environment template

```bash
cp .env.example .env
```

2) Bring up infrastructure (Postgres). Backend/AI images will build but backend will fail until Django is initialized.

```bash
docker compose up -d db
```

3) Initialize backend and frontend (see docs/README.md for detailed steps).

## Folders

- /frontend – Next.js app
- /backend – Django REST API
- /ai_service – FastAPI microservice
- /docs – Setup and developer notes

## License
MIT
