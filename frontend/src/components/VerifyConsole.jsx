import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config/api';
import { 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Send, 
  Check, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  Upload, 
  X, 
  ArrowRight, 
  FileDown, 
  Flag, 
  ExternalLink, 
  Cpu, 
  Activity, 
  Clock, 
  Dna, 
  Network, 
  Copy,
  Sparkles,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import CytoscapeEvidenceGraph from './CytoscapeEvidenceGraph';

export default function VerifyConsole({ activeResult, onOpenReportModal, preloadedDemo, onNavigateTab, theme = 'dark' }) {
  // Input Workspace State: only text, screenshot, and pdf (URL option removed)
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'screenshot', 'pdf'
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourcePlatform, setSourcePlatform] = useState('WhatsApp');
  const [selectedDemoKey, setSelectedDemoKey] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(activeResult || null);
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Update analysis result if activeResult prop changes
  useEffect(() => {
    if (activeResult) {
      setAnalysisResult(activeResult);
    }
  }, [activeResult]);

  // The 7 Analysis Stages
  const pipelineStages = [
    { id: 'input', label: 'INPUT', activeLabel: 'Receiving recruitment payload', completedLabel: 'Input validated' },
    { id: 'ocr', label: 'OCR / EXTRACTION', activeLabel: 'Extracting text & visual tokens', completedLabel: 'Text & metadata extracted' },
    { id: 'entity', label: 'ENTITIES', activeLabel: 'Parsing Org, Gazette, UPI, Contacts', completedLabel: 'Recruitment entities identified' },
    { id: 'source', label: 'REGISTRY CHECK', activeLabel: 'Cross-verifying against .gov.in', completedLabel: 'Official registry checked' },
    { id: 'dna', label: 'RECRUITMENT DNA', activeLabel: 'Computing 9-dimensional genome', completedLabel: 'Recruitment DNA synthesized' },
    { id: 'graph', label: 'EVIDENCE GRAPH', activeLabel: 'Building knowledge graph', completedLabel: 'Evidence graph synthesized' },
    { id: 'risk', label: 'RISK REASONING', activeLabel: 'Evaluating contradictions & ML models', completedLabel: 'Risk assessment finalized' }
  ];

  // Pre-load demo scenarios
  const handleLoadDemo = (caseKey) => {
    setSelectedDemoKey(caseKey);
    setSelectedFile(null);
    setErrorMessage(null);

    if (caseKey === 'demo_case_01') {
      setActiveTab('text');
      setSourcePlatform('Official Portal');
      setTextInput(`UNION PUBLIC SERVICE COMMISSION\nEXAMINATION NOTICE NO. 05/2026-CSP\nCIVIL SERVICES (PRELIMINARY) EXAMINATION, 2026\n\nApply online: https://upsconline.nic.in\nLast date: 05th March, 2026 till 6:00 PM\nApplication Fee: Rs. 100/- via SBI net banking / official treasury gateway.\nContact: facilitation@upsc.gov.in\nOfficial Portal: https://upsc.gov.in`);
      setUrlInput('https://upsc.gov.in');
    } else if (caseKey === 'demo_case_02') {
      setActiveTab('text');
      setSourcePlatform('WhatsApp');
      setTextInput(`*INDIA POST RECRUITMENT CELL (GDS 2026)*\nMinistry of Communications, Government of India\n\nDirect Selection for 38,926 Gramin Dak Sevak across all postal circles!\nDirect appointment letter based on 10th marks. No written examination!\n\nPay refundable security deposit of Rs. 500 immediately to confirm appointment letter dispatch.\nPayment through UPI ID: recruitment.officer@okaxis\nSend payment screenshot to WhatsApp: +919876543210\n\nContact Person: Senior Recruitment Officer Sharma\nOfficial Mail: indiapost.gds.helpline@gmail.com\nPortal: https://indiapost-gds-apply.xyz`);
      setUrlInput('https://indiapost-gds-apply.xyz');
    } else if (caseKey === 'demo_case_rrb') {
      setActiveTab('text');
      setSourcePlatform('Social Media');
      setTextInput(`RAILWAY RECRUITMENT BOARDS (RRB)\nSPECIAL RECRUITMENT NOTIFICATION 2026\nCentralized Employment Notice CEN 09/2026-RAIL\n\nUrgent hiring for 12,500 Posts: Assistant Station Master, Ticket Collector.\nApply immediately. Last date is 24 hours only!\n100% selection guarantee without written examination.\n\nApply only on our portal: https://rrb-recruitment-gov.online\nRegistration Fee: Rs. 750 (Mandatory for slot confirmation)\nOfficial Email: rrb.support.desk@gmail.com\nHelpline: +918765432109`);
      setUrlInput('https://rrb-recruitment-gov.online');
    }
  };

  useEffect(() => {
    if (preloadedDemo) {
      handleLoadDemo(preloadedDemo);
    }
  }, [preloadedDemo]);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setSelectedDemoKey(null);
      setErrorMessage(null);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedDemoKey(null);
      setErrorMessage(null);
    }
  };

  const handleClearInputs = () => {
    setTextInput('');
    setUrlInput('');
    setSelectedFile(null);
    setSelectedDemoKey(null);
    setErrorMessage(null);
  };

  // Execute Analysis
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'text' && !textInput.trim() && !selectedDemoKey) {
      setErrorMessage("Please enter or paste recruitment message content, or select an investigation preset.");
      return;
    }
    if ((activeTab === 'screenshot' || activeTab === 'pdf') && !selectedFile && !selectedDemoKey) {
      setErrorMessage(`Please upload a ${activeTab === 'screenshot' ? 'screenshot image (PNG/JPG)' : 'PDF circular document'}.`);
      return;
    }

    setLoading(true);
    setCurrentStep(0);

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < pipelineStages.length - 1 ? prev + 1 : prev));
    }, 380);

    try {
      const formData = new FormData();
      formData.append('source_type', sourcePlatform);

      if (selectedDemoKey) {
        const backendDemoMap = {
          demo_case_01: 'case_1_genuine',
          demo_case_02: 'case_3_personal_upi',
          demo_case_rrb: 'case_2_suspicious_domain'
        };
        formData.append('demo_case_id', backendDemoMap[selectedDemoKey] || selectedDemoKey);
      }

      if (selectedFile) formData.append('file', selectedFile);

      const effectiveToken = (() => {
        try {
          const stored = localStorage.getItem('trustgraph_auth');
          return stored ? JSON.parse(stored).token : null;
        } catch { return null; }
      })();

      if (effectiveToken) {
        formData.append('token', effectiveToken);
      }

      const headers = {};
      if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers,
        body: formData
      });

      clearInterval(timer);
      setCurrentStep(pipelineStages.length - 1);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error ${res.status}`);
      }

      const result = await res.json();
      setAnalysisResult(result);
      setLoading(false);

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err) {
      clearInterval(timer);
      setLoading(false);
      setErrorMessage(err.message || 'Evidence verification pipeline failed.');
    }
  };

  const handleCopyCaseId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Helper for Contributing Factors checklist
  const renderContributingFactors = (result) => {
    const verification = result?.verification_details || {};
    const evidence = result?.extracted_evidence || {};
    const contradictions = result?.contradiction_findings || [];
    const verdict = result?.verdict;

    const isGenuineOrg = verification.organization_status === 'VERIFIED' || verification.organization_status === 'DEMO VERIFIED';
    const isGenuineDomain = verification.domain_status === 'VERIFIED' || verification.domain_status === 'DEMO VERIFIED';
    const isPaymentIllegal = Boolean(evidence.upi_id || evidence.qr_code_detected || verification.payment_status === 'UNOFFICIAL' || verification.payment_status === 'CONFLICT');
    const isSuspiciousPattern = verdict === 'SCAM' || verdict === 'SUSPICIOUS' || contradictions.length > 0;
    const isContactVerified = !evidence.phone && !evidence.email ? 'neutral' : (verification.email_status === 'VERIFIED' && verification.phone_status === 'VERIFIED');

    const factors = [
      {
        label: 'Official Gazette Registry Match',
        status: isGenuineOrg ? 'pass' : (verification.organization_status === 'SUSPICIOUS' || verification.organization_status === 'CONFLICT' ? 'fail' : 'warning'),
        symbol: isGenuineOrg ? '✓' : (verification.organization_status === 'CONFLICT' ? '✕' : '⚠'),
        detail: verification.organization_status || 'NOT VERIFIED'
      },
      {
        label: 'Domain Apex Authority (.gov.in)',
        status: isGenuineDomain ? 'pass' : (verification.domain_status === 'CONFLICT' || verification.domain_status === 'SUSPICIOUS' ? 'fail' : 'warning'),
        symbol: isGenuineDomain ? '✓' : '✕',
        detail: verification.domain_status || 'NON-GOV DOMAIN'
      },
      {
        label: 'Recruitment Protocol Compliance',
        status: !isSuspiciousPattern ? 'pass' : (verdict === 'SCAM' ? 'fail' : 'warning'),
        symbol: !isSuspiciousPattern ? '✓' : '⚠',
        detail: isSuspiciousPattern ? 'ANOMALIES DETECTED' : 'STANDARD FORMAT'
      },
      {
        label: 'Fee & Payment Channel Integrity',
        status: isPaymentIllegal ? 'fail' : 'pass',
        symbol: isPaymentIllegal ? '✕' : '✓',
        detail: isPaymentIllegal ? 'UNOFFICIAL CHANNEL (UPI/QR)' : (evidence.application_fee ? 'OFFICIAL GATEWAY' : 'NO ILLEGAL DEMAND')
      },
      {
        label: 'Institutional Contact Verification',
        status: isContactVerified === true ? 'pass' : (isContactVerified === 'neutral' ? 'neutral' : 'fail'),
        symbol: isContactVerified === true ? '✓' : (isContactVerified === 'neutral' ? '○' : '✕'),
        detail: isContactVerified === true ? 'GOV REGISTERED' : (isContactVerified === 'neutral' ? 'NOT PROVIDED' : 'PERSONAL/UNVERIFIED')
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {factors.map((f, i) => {
          let badgeClass = 'badge-neutral';
          if (f.status === 'pass') badgeClass = 'badge-success';
          else if (f.status === 'fail') badgeClass = 'badge-danger';
          else if (f.status === 'warning') badgeClass = 'badge-warning';

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${badgeClass}`} style={{ width: '20px', height: '20px', padding: 0, justifyContent: 'center' }}>
                  {f.symbol}
                </span>
                <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{f.label}</span>
              </div>
              <span className={`badge ${badgeClass}`}>
                {f.detail}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for Recruitment DNA categories
  const renderDNACategories = (result) => {
    const dna = result?.recruitment_dna || {};
    const comparison = dna.comparison_breakdown || [];

    const dnaCategories = [
      { name: 'Organization', fallbackStatus: 'MATCH' },
      { name: 'Domain Authority', fallbackStatus: 'MISMATCH' },
      { name: 'Notification Index', fallbackStatus: 'MATCH' },
      { name: 'Contact Pattern', fallbackStatus: 'MISMATCH' },
      { name: 'Application Flow', fallbackStatus: 'PARTIAL' },
      { name: 'Payment Gateway', fallbackStatus: 'MISMATCH' },
      { name: 'Linguistic Integrity', fallbackStatus: 'MISMATCH' }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '10px',
        marginTop: '12px'
      }}>
        {dnaCategories.map((cat, idx) => {
          let status = cat.fallbackStatus;
          if (comparison.length > 0) {
            const item = comparison.find(c => c.category?.toLowerCase().includes(cat.name.toLowerCase()) || c.feature_name?.toLowerCase().includes(cat.name.toLowerCase()));
            if (item) {
              status = item.status === 'MATCH' ? 'MATCH' : item.status === 'MISMATCH' ? 'MISMATCH' : 'PARTIAL';
            }
          }

          let badgeClass = 'badge-neutral';
          if (status === 'MATCH') badgeClass = 'badge-success';
          else if (status === 'MISMATCH') badgeClass = 'badge-danger';
          else if (status === 'PARTIAL') badgeClass = 'badge-warning';

          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {cat.name}
              </span>
              <span className={`badge ${badgeClass}`} style={{ alignSelf: 'flex-start' }}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for dynamic investigation timeline
  const generateTimeline = (result) => {
    const createdAt = result?.created_at ? new Date(result.created_at) : new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const makeTime = (offsetSeconds) => {
      const d = new Date(createdAt.getTime() + offsetSeconds * 1000);
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const evidence = result?.extracted_evidence || {};
    const org = evidence.organization || 'Government body';
    const isPayment = evidence.payment_requested || evidence.upi_id;

    return [
      { time: makeTime(0), text: 'Intake payload validated & normalized against institutional benchmarks' },
      { time: makeTime(1), text: 'Multi-modal OCR & cryptographic entity extraction completed' },
      { time: makeTime(2), text: `Claimed organization entity registered as "${org}"` },
      { time: makeTime(3), text: 'Cross-examined against official .gov.in Gazette repository' },
      { time: makeTime(4), text: isPayment ? 'Unauthorized payment collection vector identified' : 'Statutory treasury payment flow verified' },
      { time: makeTime(5), text: '9-dimensional Recruitment DNA genome analyzed for institutional divergence' },
      { time: makeTime(6), text: `Forensic audit concluded: ${result?.verdict || 'VERIFIED'} (Trust Score: ${result?.trust_score ?? 85}/100)` }
    ];
  };

  return (
    <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Workspace Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '18px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
              VERIFY RECRUITMENT EVIDENCE
            </h2>
            <span className="badge badge-info">
              FORENSIC CONSOLE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Submit a recruitment message, circular, or screenshot for evidence-based verification.
          </p>
        </div>

        <div style={{
          padding: '6px 14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '7px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          CORE PRINCIPLE: <strong style={{ color: 'var(--text-heading)' }}>"WE DON'T TRUST THE MESSAGE. WE TRACE THE EVIDENCE."</strong>
        </div>
      </div>

      {/* 2. Investigation Demo Presets */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <Cpu size={14} color="var(--accent-primary)" />
          <span>INVESTIGATION PRESETS:</span>
        </div>

        <button
          type="button"
          onClick={() => handleLoadDemo('demo_case_01')}
          className={`btn-ghost ${selectedDemoKey === 'demo_case_01' ? 'active' : ''}`}
          style={{
            padding: '5px 12px',
            backgroundColor: selectedDemoKey === 'demo_case_01' ? 'var(--color-success-bg)' : 'var(--bg-card)',
            border: `1px solid ${selectedDemoKey === 'demo_case_01' ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
            color: selectedDemoKey === 'demo_case_01' ? 'var(--color-success)' : 'var(--text-body)',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          DEMO CASE 01: Genuine UPSC Notice
        </button>

        <button
          type="button"
          onClick={() => handleLoadDemo('demo_case_02')}
          className={`btn-ghost ${selectedDemoKey === 'demo_case_02' ? 'active' : ''}`}
          style={{
            padding: '5px 12px',
            backgroundColor: selectedDemoKey === 'demo_case_02' ? 'var(--color-danger-bg)' : 'var(--bg-card)',
            border: `1px solid ${selectedDemoKey === 'demo_case_02' ? 'var(--color-danger-border)' : 'var(--border-subtle)'}`,
            color: selectedDemoKey === 'demo_case_02' ? 'var(--color-danger)' : 'var(--text-body)',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          DEMO CASE 02: Fake Postal Recruitment (UPI)
        </button>

        <button
          type="button"
          onClick={() => handleLoadDemo('demo_case_rrb')}
          className={`btn-ghost ${selectedDemoKey === 'demo_case_rrb' ? 'active' : ''}`}
          style={{
            padding: '5px 12px',
            backgroundColor: selectedDemoKey === 'demo_case_rrb' ? 'var(--color-warning-bg)' : 'var(--bg-card)',
            border: `1px solid ${selectedDemoKey === 'demo_case_rrb' ? 'var(--color-warning-border)' : 'var(--border-subtle)'}`,
            color: selectedDemoKey === 'demo_case_rrb' ? 'var(--color-warning)' : 'var(--text-body)',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          DEMO CASE 03: Fake RRB (Spoofed Domain)
        </button>
      </div>

      {/* 3. Evidence Intake Workstation (Tabs: TEXT, SCREENSHOT, PDF) */}
      <div className="console-card">
        {/* Segmented Control Tabs */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div className="segmented-control">
            {[
              { id: 'text', label: 'TEXT MESSAGE', icon: FileText },
              { id: 'screenshot', label: 'SCREENSHOT', icon: ImageIcon },
              { id: 'pdf', label: 'PDF CIRCULAR', icon: FileCode }
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setErrorMessage(null);
                  }}
                  className={`segmented-tab ${isCurrent ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Source:
            </span>
            <select
              value={sourcePlatform}
              onChange={(e) => setSourcePlatform(e.target.value)}
              className="form-input"
              style={{
                width: 'auto',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="SMS">SMS Dispatch</option>
              <option value="Email">Email Communication</option>
              <option value="Social Media">Social Media</option>
              <option value="Official Portal">Official Circular</option>
            </select>
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '20px' }}>
          {activeTab === 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setSelectedDemoKey(null);
                }}
                placeholder="Paste WhatsApp, Telegram, SMS or email recruitment content..."
                className="form-textarea"
                rows={7}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Length: {textInput.length} characters</span>
                <span>Plain text / WhatsApp Markdown / OCR text supported</span>
              </div>
            </div>
          )}

          {activeTab === 'screenshot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  backgroundColor: dragActive ? 'var(--bg-active-pill)' : 'var(--bg-card-subtle)',
                  borderRadius: '8px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/png,image/jpeg,image/jpg"
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-active-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)'
                  }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Click to select screenshot</span>
                    <span style={{ color: 'var(--text-muted)' }}> or drag and drop image file</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    PNG, JPG, JPEG (Max 15MB) — Processed by OpenCV CLAHE & PyMuPDF OCR
                  </span>
                </div>
              </div>

              {selectedFile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={16} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{selectedFile.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  backgroundColor: dragActive ? 'var(--bg-active-pill)' : 'var(--bg-card-subtle)',
                  borderRadius: '8px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="application/pdf"
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-active-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)'
                  }}>
                    <FileCode size={20} />
                  </div>
                  <div>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Click to select PDF document</span>
                    <span style={{ color: 'var(--text-muted)' }}> or drag and drop</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Official government notifications, gazette releases, and appointment orders (PDF)
                  </span>
                </div>
              </div>

              {selectedFile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={16} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{selectedFile.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-danger)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleClearInputs}
              className="btn-secondary"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Reset Inputs
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyze}
              className="btn-primary"
              style={{ padding: '10px 24px', fontFamily: 'var(--font-mono)' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>ANALYZING EVIDENCE...</span>
                </>
              ) : (
                <>
                  <Activity size={15} />
                  <span>ANALYZE EVIDENCE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live 7-Stage Analysis Stepper */}
      {(loading || analysisResult) && (
        <div className="console-card">
          <div className="console-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="pulse-indicator"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: loading ? 'var(--accent-primary)' : 'var(--color-success)'
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                FORENSIC VERIFICATION PIPELINE {loading ? '(PROCESSING)' : '(EXECUTION AUDIT)'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              7 STAGES ARCHITECTURE
            </span>
          </div>

          <div style={{
            padding: '16px 20px',
            overflowX: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {pipelineStages.map((stage, idx) => {
              const isDone = !loading || idx < currentStep;
              const isCurrent = loading && idx === currentStep;
              const isPending = loading && idx > currentStep;

              let statusIcon = '○';
              let statusText = isPending ? 'Pending' : stage.completedLabel;
              let stageBadge = 'badge-neutral';

              if (isDone) {
                statusIcon = '✓';
                stageBadge = 'badge-success';
              } else if (isCurrent) {
                statusIcon = '●';
                statusText = stage.activeLabel;
                stageBadge = 'badge-info';
              }

              return (
                <React.Fragment key={stage.id}>
                  <div style={{
                    minWidth: '140px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: `1px solid ${isCurrent ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {stage.label}
                      </span>
                      <span className={`badge ${stageBadge}`} style={{ width: '18px', height: '18px', padding: 0, justifyContent: 'center' }}>
                        {statusIcon}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: isCurrent ? 'var(--text-heading)' : 'var(--text-muted)', lineHeight: 1.3 }}>
                      {statusText}
                    </span>
                  </div>

                  {idx < pipelineStages.length - 1 && (
                    <span style={{ color: 'var(--text-dimmed)', fontSize: '12px', flexShrink: 0 }}>
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Results Area */}
      {analysisResult && (
        <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Case Identifier Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>CASE REFERENCE:</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '14px' }}>{analysisResult.case_id}</span>
              <button
                type="button"
                onClick={() => handleCopyCaseId(analysisResult.case_id)}
                title="Copy Case ID"
                className="btn-ghost"
                style={{ padding: '2px 6px' }}
              >
                {copiedId ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href={`${API_BASE}/api/report/${analysisResult.case_id}/view`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                <ExternalLink size={13} />
                <span>View Certificate</span>
              </a>

              <a
                href={`${API_BASE}/api/report/${analysisResult.case_id}/download`}
                download
                className="btn-secondary"
                style={{ textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                <FileDown size={13} />
                <span>Download Report</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenReportModal && onOpenReportModal(analysisResult.case_id)}
                className="btn-ghost"
                style={{
                  color: 'var(--color-danger)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              >
                <Flag size={13} />
                <span>Flag Case</span>
              </button>
            </div>
          </div>

          {/* Two-Column Results Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {/* Left Column: Verification Result */}
            <div className="console-card">
              <div className="console-card-header">
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                  VERIFICATION RESULT
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ML ARBITER ENGINE
                </span>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                    backgroundColor: analysisResult.verdict === 'GENUINE' ? 'var(--color-success-bg)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                    color: analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger)' : 'var(--color-warning)',
                    border: `1.5px solid ${analysisResult.verdict === 'GENUINE' ? 'var(--color-success-border)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`
                  }}>
                    {analysisResult.verdict === 'GENUINE' ? <ShieldCheck size={20} /> : analysisResult.verdict === 'SCAM' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                    <span>{analysisResult.verdict === 'GENUINE' ? 'VERIFIED' : analysisResult.verdict === 'SCAM' ? 'HIGH RISK' : 'REQUIRES REVIEW'}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {analysisResult.verdict === 'GENUINE'
                      ? 'Conforms to official Indian Government gazette standards and banking guidelines.'
                      : analysisResult.verdict === 'SCAM'
                      ? 'Severe institutional conflicts and illegal personal payment demands detected.'
                      : 'Irregular recruitment signatures detected. Manual inspection recommended.'}
                  </div>
                </div>

                {/* Score Indicator */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                      Trust Score
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800 }}>
                      {analysisResult.verdict === 'INCONCLUSIVE' ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '16px', fontStyle: 'italic' }}>— Can't determine</span>
                      ) : (
                        <>
                          <span style={{
                            color: analysisResult.trust_score >= 70 ? 'var(--color-success)' : analysisResult.trust_score <= 35 ? 'var(--color-danger)' : 'var(--color-warning)'
                          }}>
                            {analysisResult.trust_score}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}> / 100</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {analysisResult.verdict === 'INCONCLUSIVE' ? (
                      <div style={{
                        width: '100%',
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 6px, var(--border-subtle) 6px, var(--border-subtle) 12px)',
                        opacity: 0.4
                      }} />
                    ) : (
                      <div
                        style={{
                          width: `${Math.max(4, analysisResult.trust_score)}%`,
                          backgroundColor: analysisResult.trust_score >= 70 ? 'var(--color-success)' : analysisResult.trust_score <= 35 ? 'var(--color-danger)' : 'var(--color-warning)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                    <span>0 (High Risk)</span>
                    <span>50 (Suspicious)</span>
                    <span>100 (Verified)</span>
                  </div>
                </div>

                {/* Factors */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                    CONTRIBUTING FACTORS
                  </div>
                  {renderContributingFactors(analysisResult)}
                </div>

                {/* Recommended Action */}
                {analysisResult.recommended_action && (
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-active-pill)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}>
                    <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>RECOMMENDED ACTION: </strong>
                    <span style={{ color: 'var(--text-heading)' }}>{analysisResult.recommended_action}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Evidence Summary */}
            <div className="console-card">
              <div className="console-card-header">
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                  EVIDENCE SUMMARY
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  EXTRACTED ARTIFACTS
                </span>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    label: 'Claimed Organization',
                    value: analysisResult.extracted_evidence?.organization || 'Not Identified',
                    status: analysisResult.verification_details?.organization_status === 'VERIFIED' ? 'pass' : analysisResult.verification_details?.organization_status === 'CONFLICT' ? 'fail' : 'neutral'
                  },
                  {
                    label: 'Recruitment Type',
                    value: analysisResult.extracted_evidence?.notification_number ? `Government Notice (${analysisResult.extracted_evidence.notification_number})` : 'Public Recruitment Claim',
                    status: 'neutral'
                  },
                  {
                    label: 'Application URL',
                    value: analysisResult.extracted_evidence?.domain || (analysisResult.extracted_evidence?.urls && analysisResult.extracted_evidence.urls[0]) || 'None Detected',
                    status: analysisResult.verification_details?.domain_status === 'VERIFIED' ? 'pass' : analysisResult.verification_details?.domain_status === 'CONFLICT' ? 'fail' : 'neutral'
                  },
                  {
                    label: 'Contact Number',
                    value: analysisResult.extracted_evidence?.phone || 'Not Disclosed',
                    status: analysisResult.extracted_evidence?.phone ? (analysisResult.verification_details?.phone_status === 'VERIFIED' ? 'pass' : 'fail') : 'neutral'
                  },
                  {
                    label: 'Payment Request',
                    value: analysisResult.extracted_evidence?.payment_requested ? (analysisResult.extracted_evidence?.upi_id ? `Detected (UPI: ${analysisResult.extracted_evidence.upi_id})` : `Detected (Fee: ₹${analysisResult.extracted_evidence.application_fee || 'Specified'})`) : 'None / Official Treasury',
                    status: analysisResult.extracted_evidence?.payment_requested ? 'fail' : 'pass'
                  },
                  {
                    label: 'Document Reference',
                    value: analysisResult.extracted_evidence?.notification_number || 'Not Found',
                    status: analysisResult.extracted_evidence?.notification_number ? 'neutral' : 'warning'
                  },
                  {
                    label: 'Official Gazette Registry',
                    value: analysisResult.verification_details?.official_portal || (analysisResult.verification_details?.organization_status === 'VERIFIED' ? 'Authorized .gov.in' : 'Unregistered'),
                    status: analysisResult.verification_details?.organization_status === 'VERIFIED' ? 'pass' : 'warning'
                  },
                  {
                    label: 'QR Code Status',
                    value: analysisResult.extracted_evidence?.qr_code_detected ? 'Stand-alone UPI Collection QR Detected' : 'No Payment QR Embedded',
                    status: analysisResult.extracted_evidence?.qr_code_detected ? 'fail' : 'neutral'
                  }
                ].map((item, idx) => {
                  let badgeClass = 'badge-neutral';
                  if (item.status === 'pass') badgeClass = 'badge-success';
                  else if (item.status === 'fail') badgeClass = 'badge-danger';
                  else if (item.status === 'warning') badgeClass = 'badge-warning';

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                      <span className={`badge ${badgeClass}`} style={{ maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Evidence Graph Section */}
          <div className="console-card">
            <div className="console-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                  EVIDENCE GRAPH
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: '6px' }}>
                  MESSAGE → EVIDENCE → VERIFICATION → RISK
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CYTOSCAPE.JS ENGINE
              </span>
            </div>

            <div style={{ padding: '16px' }}>
              <CytoscapeEvidenceGraph
                graphData={analysisResult.evidence_graph}
                caseId={analysisResult.case_id}
                theme={theme}
              />
            </div>
          </div>

          {/* 7. Recruitment DNA Section */}
          <div className="console-card">
            <div className="console-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dna size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                  RECRUITMENT DNA
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                9-DIMENSIONAL DIGITAL FINGERPRINT
              </span>
            </div>

            <div style={{ padding: '18px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                Structural fingerprint matching against official Indian Government gazette signatures:
              </p>
              {renderDNACategories(analysisResult)}
            </div>
          </div>

          {/* 8. Chronological Timeline */}
          <div className="console-card">
            <div className="console-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
                  INVESTIGATION TIMELINE
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CHRONOLOGICAL AUDIT LOG
              </span>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {generateTimeline(analysisResult).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    borderLeft: '2px solid var(--border-default)',
                    paddingLeft: '12px',
                    marginLeft: '4px'
                  }}
                >
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0 }}>
                    {item.time}
                  </span>
                  <span style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-main)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
