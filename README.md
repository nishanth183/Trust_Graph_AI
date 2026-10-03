---
title: TrustGraph AI Backend
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
---

# TRUSTGRAPH AI

### AI-Based Fake Government Job & Recruitment Scam Detection System
> **Core Principle:** *"We don't trust the message; we trust the evidence."*

---

## 1. Project Overview
**TRUSTGRAPH AI** is an advanced AI and graph reasoning platform engineered to protect Indian citizens, students, and job seekers from fraudulent government recruitment schemes, fake appointment letters, and phishing portals impersonating organizations such as UPSC, SSC, Railway Recruitment Boards (RRB), India Post (GDS), and State PSCs.

Rather than running a naive `Input → OCR → AI → Scam` keyword classifier, TrustGraph AI introduces two major technical innovations:
1. **Recruitment DNA (9-Dimensional Digital Feature Genome)**
2. **Attributed Evidence Graph (Entity-Relationship Knowledge Graph)**

---

## 2. Problem Statement
Every year, millions of Indian youth fall victim to sophisticated employment syndicates. Scammers fabricate official-looking circulars with cloned emblems, create typosquatted domains (`*.online`, `*.xyz`), circulate urgent WhatsApp messages, and extract illicit "application fees" or "security deposits" via personal UPI accounts and QR codes. Naive keyword models fail because scammers clone authentic government texts verbatim.

---

## 3. The TrustGraph Solution
TrustGraph AI solves this by cross-verifying structural credentials:
- **Never trusts message claims**: Cross-examines claimed departments against the verified official government registry (`.gov.in` / `.nic.in`).
- **Payment channel verification**: Detects personal UPI handles (`@okaxis`, `@paytm`, `@ybl`) and standalone payment QR codes, which are illegal for statutory public recruitment.
- **Cross-case scam syndicate detection**: Identifies reused phone numbers, UPI handles, and spoofed hosting servers across distinct notifications.
- **Explainable Decisions**: Translates complex feature vectors into human-comprehensible positive supporting and negative risk evidence.

---

## 4. Architecture
```
                         [ USER INPUT ]
               (Text / Image / PDF / Portal URL)
                             ↓
                 [ EVIDENCE EXTRACTION ]
       (Org, Gazette No, Fee, Phone, UPI, QR, Domain)
                             ↓
                    [ AI UNDERSTANDING ]
          (NLP Intent, Coercive Language, Vision)
                             ↓
                   [ RECRUITMENT DNA ]
             (9-Dimensional Feature Genome)
                             ↓
                   [ EVIDENCE GRAPH ]
            (NetworkX / Neo4j Graph Model)
                             ↓
        [ OFFICIAL RECRUITMENT KNOWLEDGE BASE ]
           (UPSC, SSC, RRB, India Post, State PSCs)
                             ↓
               [ DNA + GRAPH MATCHING ]
         (Signature Similarity & Pattern Alignment)
                             ↓
              [ SCAM NETWORK ANALYZER ]
           (Repeated Syndicate Infrastructure)
                             ↓
          [ CONTRADICTION & RISK REASONING ]
           (Institutional Violation Rules)
                             ↓
             [ ML RISK ENGINE & ARBITER ]
        (Calibrated Ensemble + Safety Overrides)
                             ↓
                  [ EXPLAINABLE AI ]
       (Supporting vs Risk Factors / SHAP-Style)
                             ↓
                 [ VERDICT & DASHBOARD ]
         (GENUINE / SUSPICIOUS / SCAM / INCONCLUSIVE)
```

---

## 5. Key Features
- **Multi-Modal Input Processing**: Accepts pasted text, screenshots/posters (PNG, JPG, JPEG), scanned PDF documents, and website URLs.
- **Recruitment DNA Engine**: Evaluates 9 digital signatures:
  1. Organization Signature
  2. Notification Signature
  3. Domain Signature
  4. Contact Signature
  5. Visual Signature
  6. Writing / Linguistic Signature
  7. Layout Signature
  8. Payment Signature
  9. Temporal Signature
- **Interactive Evidence Graph**: Visualizes entity-relationship connections using Cytoscape.js with zoom, pan, node inspection, and conflict flags.
- **Official Knowledge Base**: Curated benchmarks for UPSC, SSC, RRB, India Post, and State PSCs.
- **Syndicate Intelligence Registry**: Catalogs repeated phone numbers, UPI handles, and spoofed domains.
- **Verifiable PDF/HTML Certificates**: Generates downloadable audit reports for citizens and law enforcement.
- **Strict Privacy Safeguards**: Masks personal phone numbers and emails in UI, prevents arbitrary file execution, and disallows loopback access.

---

## 6. Technology Stack

### Backend
- **Framework:** Python 3.10+, FastAPI, Pydantic v2
- **Document & PDF Processing:** PyMuPDF (`fitz`), Pillow
- **Computer Vision:** OpenCV (`cv2`) for CLAHE contrast enhancement, OTSU binarization, and QRCodeDetector
- **NLP & Machine Learning:** scikit-learn (GradientBoosting / RandomForest), NumPy, Pandas
- **Graph Modeling:** NetworkX (in-memory graph engine with Neo4j-compatible Cytoscape export)
- **Security:** Input sanitization, file magic-byte validation, loopback restriction

### Frontend
- **Framework:** React 18, Vite 5
- **Styling:** Custom Cyber-Glassmorphism CSS Design System
- **Graph Visualization:** Cytoscape.js
- **Icons:** Lucide React

### Storage & Containers
- **Data Engine:** Persistent hybrid JSON/SQLite engine with pluggable MongoDB and Neo4j connection adapters
- **Containerization:** Docker, Docker Compose, Nginx

---

## 7. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm
- (Optional) Docker and Docker Compose

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/TrustGraph-AI.git
cd TrustGraph-AI
```

### Step 2: Install Backend Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 8. Environment Variables
Copy `.env.example` to `.env`:
```env
DEMO_MODE=true
PROJECT_NAME="TRUSTGRAPH AI"
VERSION="1.0.0"
MAX_FILE_SIZE_MB=15
MONGODB_URI="mongodb://localhost:27017/trustgraph"
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="password"
SECRET_KEY="trustgraph-super-secret-key-2026"
```

---

## 9. Running Locally

### Start Backend Server
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Start Frontend Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 10. Database Setup
TrustGraph AI includes an **embedded zero-setup storage engine** that works out of the box without requiring local database servers.

To connect external enterprise databases:
- **MongoDB**: Set `MONGODB_URI` in `.env` to persist cases to Mongo collections.
- **Neo4j**: Set `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` in `.env` to synchronize evidence graphs to Neo4j.

---

## 11. Interactive Demo Mode
The system contains pre-loaded demo scenarios clearly marked with the **`DEMO DATA`** badge:
- **Case 1: Genuine UPSC Notice** — Authentic CSE notice matching official `.gov.in` domain and treasury banking.
- **Case 2: Fake RRB Notice with Suspicious Domain** — Typosquatted `rrb-recruitment-gov.online` domain requesting fee.
- **Case 3: Fake India Post GDS Notice** — Direct personal UPI (`recruitment.officer@okaxis`) and WhatsApp contact.
- **Case 4: Scam Syndicate Reuse** — Cross-case alert reusing the exact phone and UPI from Case 3.
- **Case 5: Master Prompt Scenario** — The exact test message specified in Section 29.

---

## 12. API Documentation Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Unified multi-stage verification pipeline |
| `POST` | `/api/extract` | Extract raw credentials and entities |
| `POST` | `/api/verify` | Cross-check against official government registry |
| `POST` | `/api/dna` | Generate and compare 9-dimensional Recruitment DNA |
| `POST` | `/api/graph` | Generate Cytoscape-compatible Evidence Graph |
| `POST` | `/api/risk` | Execute ML risk model and rule reasoning |
| `GET` | `/api/case/{id}` | Retrieve archived case results |
| `GET` | `/api/cases` | List all verified audit cases |
| `GET` | `/api/scam-intelligence` | Retrieve global syndicate intelligence feed |
| `GET` | `/api/report/{id}/download` | Download HTML/PDF verification certificate |
| `GET` | `/api/health` | Service health status and loaded model telemetry |

---

## 13. Running Automated Tests
Run the comprehensive test suite (Unit, Extraction, DNA, Graph, Risk, Security, and API tests):
```bash
python -m unittest discover -s backend/tests -p "test_*.py"
```
*Current test suite: 15 passing tests in 0.046s.*

---

## 14. Docker Deployment
Deploy the full 4-tier stack (Backend, Frontend, MongoDB, Neo4j) with a single command:
```bash
docker compose up --build -d
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Neo4j Console: `http://localhost:7474`

---

## 15. Known Limitations
1. **Official Gazettes Scope**: The initial prototype curates top central agencies (UPSC, SSC, RRB, India Post, TNPSC). Additional state recruitment boards can be registered in `verification_service.py`.
2. **Network WHOIS in Air-Gapped Environments**: In offline demo mode, external WHOIS lookups are gracefully flagged as `UNAVAILABLE` rather than fabricating fake domain registration dates.

---

## 16. Future Scope
- **Multi-Lingual NLP**: Extending support to Hindi, Tamil, Telugu, Bengali, and Marathi regional notices.
- **WhatsApp Webhook Bot**: Deploying TrustGraph AI as an official citizen verification bot on WhatsApp and Telegram.
- **Direct 1930 / National Cybercrime Portal Integration**: Allowing citizens to dispatch flagged cases directly to law enforcement cyber cells.
