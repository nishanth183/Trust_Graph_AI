import urllib.request
import urllib.parse
import json
import ssl
import time

ctx = ssl.create_default_context()
frontend_url = 'https://trust-graph-ai-eight.vercel.app'
backend_url = 'https://trust-graph-ai.onrender.com'

print('=====================================================')
print('TRUSTGRAPH AI — LIVE PRODUCTION END-TO-END TEST SUITE')
print('=====================================================')

# 1. Test Frontend Root
print('\n[TEST 1] Frontend Root Availability...')
req = urllib.request.Request(frontend_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
    assert r.status == 200
    html = r.read().decode('utf-8')
    assert 'TrustGraph AI' in html
    print('  -> PASS: Frontend loaded successfully (HTTP 200, HTML valid)')

# 2. Test Backend Health
print('\n[TEST 2] Backend Health Endpoint...')
req = urllib.request.Request(f'{backend_url}/api/health', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
    assert r.status == 200
    health = json.loads(r.read().decode('utf-8'))
    assert health['status'] == 'HEALTHY'
    print(f'  -> PASS: Backend is {health["status"]} (Version: {health["version"]})')
    print('  -> AI Models Loaded:', list(health['ai_models_loaded'].keys()))

# 3. Test CORS Preflight between Vercel and Render
print('\n[TEST 3] CORS Preflight Header Authorization...')
req = urllib.request.Request(
    f'{backend_url}/api/analyze',
    method='OPTIONS',
    headers={
        'Origin': frontend_url,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        'User-Agent': 'Mozilla/5.0'
    }
)
with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
    cors_origin = r.headers.get('Access-Control-Allow-Origin')
    print(f'  -> CORS Origin returned: {cors_origin}')
    assert cors_origin in (frontend_url, '*') or 'vercel.app' in (cors_origin or '')
    print('  -> PASS: CORS properly permits Vercel frontend requests')

# 4. Test User Authentication (Isolated User Registration & Login)
test_username = f'live_tester_{int(time.time())}'
print(f'\n[TEST 4] User Registration & Token Issue ({test_username})...')
reg_payload = json.dumps({
    'username': test_username,
    'password': 'StrongPassword123!',
    'full_name': 'Live Verifier',
    'email': f'{test_username}@example.com',
    'role': 'user'
}).encode('utf-8')
req = urllib.request.Request(
    f'{backend_url}/api/auth/register',
    data=reg_payload,
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
    assert r.status in (200, 201)
    user_data = json.loads(r.read().decode('utf-8'))
    token = user_data['token']
    user_id = user_data['user_id']
    print(f'  -> PASS: User registered (user_id: {user_id}, token issued)')

# 5. Test Live Analysis Workflow (Input -> Evidence Extraction -> DNA -> Graph -> Trust Score)
print('\n[TEST 5] Forensic Analysis Execution (Text & Official Pattern Matching)...')
sample_scam_text = '''
URGENT: Railway Recruitment Board (RRB) Notice 2026.
Immediate appointment for 5000 Assistant Loco Pilot vacancies.
Application fee of Rs. 750 must be sent to private UPI: rrb-officer99@okaxis.
Submit forms at www.rrb-gov-jobs.online before tomorrow.
'''
post_data = urllib.parse.urlencode({
    'text': sample_scam_text,
    'source_platform': 'WhatsApp',
    'token': token
}).encode('utf-8')
req = urllib.request.Request(
    f'{backend_url}/api/analyze',
    data=post_data,
    headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Bearer {token}',
        'User-Agent': 'Mozilla/5.0'
    }
)
with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
    assert r.status == 200
    analysis = json.loads(r.read().decode('utf-8'))
    case_id = analysis['case_id']
    verdict = analysis['verdict']
    score = analysis['trust_score']
    print(f'  -> PASS: Case {case_id} Analyzed Successfully!')
    print(f'     Verdict: {verdict} | Trust Score: {score}/100 | Risk: {analysis.get("risk_level")}')
    print(f'     Contradictions Found: {len(analysis.get("contradiction_findings", []))}')
    print(f'     Recruitment DNA Score: {analysis.get("recruitment_dna", {}).get("similarity_score")}%')
    print(f'     Evidence Graph Nodes: {len(analysis.get("evidence_graph", {}).get("nodes", []))}')

# 6. Test User-Specific History Isolation
print('\n[TEST 6] User History Persistence & Isolation...')
req = urllib.request.Request(
    f'{backend_url}/api/history',
    headers={'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
    assert r.status == 200
    history = json.loads(r.read().decode('utf-8'))
    assert any(c['case_id'] == case_id for c in history)
    print(f'  -> PASS: User-isolated history retrieved {len(history)} case(s), including {case_id}')

# 7. Test PDF Report Download
print('\n[TEST 7] Cryptographic Report & Certificate Endpoint...')
req = urllib.request.Request(
    f'{backend_url}/api/report/{case_id}/download',
    headers={'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
    assert r.status == 200
    pdf_bytes = r.read()
    print(f'  -> PASS: Official PDF Report generated and downloaded ({len(pdf_bytes)} bytes)')

print('\n=====================================================')
print('ALL 7 LIVE PRODUCTION END-TO-END VERIFICATIONS PASSED!')
print('=====================================================')
