# Peerverse Setup Guide

## Prerequisites
- Python 3.12+
- Node.js 18+
- Docker Desktop

## 1) Environment
- Copy `.env.example` to `.env` and adjust values.

## 2) Database (Docker)
```bash
docker compose up -d db
```

## 3) Backend (Django)
```powershell
# create venv and install deps
py -m venv backend\.venv
backend\.venv\Scripts\python -m pip install --upgrade pip
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt

# init project and app
backend\.venv\Scripts\python -m django startproject peerverse backend
backend\.venv\Scripts\python backend\manage.py startapp core
```

Then configure settings (REST Framework, JWT, DB, CORS, Google OAuth), add models, run migrations:
```powershell
backend\.venv\Scripts\python backend\manage.py makemigrations
backend\.venv\Scripts\python backend\manage.py migrate
backend\.venv\Scripts\python backend\manage.py createsuperuser
backend\.venv\Scripts\python backend\manage.py runserver 0.0.0.0:8000
```

## 4) Frontend (Next.js + Tailwind)
```bash
npx create-next-app@latest frontend --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --no-git
```

## 5) AI Service
The AI microservice is ready to run:
```bash
pip install -r ai_service/requirements.txt
uvicorn ai_service.main:app --reload --port 8001
```

## 6) Docker (optional full stack)
```bash
docker compose up --build
```

See project README for more.
