# Deployment Guide: TrustGraph AI

## 1. Local Development
### Backend
```bash
# In project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API runs on `http://127.0.0.1:8000` with interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
UI runs on `http://localhost:5173` with proxy routing to `http://127.0.0.1:8000/api`.

## 2. Docker & Containerization
Run all 4 services (FastAPI Backend, React Frontend, MongoDB, and Neo4j) with Docker Compose:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Neo4j Browser: `http://localhost:7474`
- MongoDB: `localhost:27017`
