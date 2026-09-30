# TrustGraph AI - API Reference

## Base URL
`/api`

## Endpoints

### 1. Unified Analysis
- **Endpoint:** `POST /api/analyze`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `text` (string, optional): Pasted recruitment text or forward.
  - `url` (string, optional): Recruitment portal link.
  - `source_type` (string, optional): WhatsApp, Telegram, SMS, Email, Social Media, Other.
  - `demo_case_id` (string, optional): `case_1_genuine`, `case_2_suspicious_domain`, `case_3_personal_upi`, `case_4_reused_infrastructure`, `sample_prompt_scenario`.
  - `file` (binary, optional): PNG, JPG, JPEG, or PDF file.
- **Response:** `CaseAnalysisResponse`

### 2. Evidence Extraction
- **Endpoint:** `POST /api/extract`
- **Request Body:** `{ "text": "...", "url": "...", "source_type": "..." }`
- **Response:** `{ "evidence": { ... } }`

### 3. Official Verification
- **Endpoint:** `POST /api/verify`
- **Request Body:** `{ "organization": "...", "notification_number": "...", "domain": "...", "email": "...", "upi_id": "..." }`
- **Response:** `{ "verification": { ... } }`

### 4. Recruitment DNA
- **Endpoint:** `POST /api/dna`
- **Request Body:** `{ "evidence": { ... } }`
- **Response:** `{ "recruitment_dna": { "similarity_score": 85.0, ... } }`

### 5. Evidence Graph
- **Endpoint:** `POST /api/graph`
- **Request Body:** `{ "evidence": { ... }, "case_id": "TG-2026-000001" }`
- **Response:** Cytoscape-compatible `{ "nodes": [...], "edges": [...] }`

### 6. Case Retrieval & History
- **Endpoint:** `GET /api/case/{case_id}`
- **Endpoint:** `GET /api/cases`
- **Endpoint:** `GET /api/demo-cases`

### 7. Reports & Feedback
- **Endpoint:** `POST /api/report`
- **Endpoint:** `GET /api/report/{case_id}/download`
- **Endpoint:** `GET /api/report/{case_id}/view`

### 8. System Health & Intelligence Feed
- **Endpoint:** `GET /api/health`
- **Endpoint:** `GET /api/scam-intelligence`
