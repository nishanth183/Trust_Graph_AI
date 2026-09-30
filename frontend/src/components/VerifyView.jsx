import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Globe, 
  Send, 
  Check, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function VerifyView({ onAnalyzeSuccess, preloadedDemo }) {
  const [activeInputTab, setActiveInputTab] = useState('text'); // 'text', 'file', 'url'
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourcePlatform, setSourcePlatform] = useState('WhatsApp');
  const [selectedDemoKey, setSelectedDemoKey] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const analysisSteps = [
    "Extracting recruitment entities and credentials...",
    "Executing NLP intent and semantic pattern analysis...",
    "Generating 9-dimensional Recruitment DNA...",
    "Synthesizing Attributed Evidence Graph...",
    "Cross-referencing Official Government Gazette registry...",
    "Analyzing Scam Syndicate Infrastructure Linkages...",
    "Evaluating Contradictions and Risk Reasoning...",
    "Computing ML Risk Prediction and SHAP-Style Attributions..."
  ];

  // Pre-load demo presets
  const handleLoadDemo = (caseKey) => {
    setSelectedDemoKey(caseKey);
    setSelectedFile(null);
    setErrorMessage(null);

    if (caseKey === 'case_1_genuine') {
      setActiveInputTab('text');
      setSourcePlatform('Official Portal');
      setTextInput(`UNION PUBLIC SERVICE COMMISSION\nEXAMINATION NOTICE NO. 05/2026-CSP\nCIVIL SERVICES (PRELIMINARY) EXAMINATION, 2026\n\nApply online: https://upsconline.nic.in\nLast date: 05th March, 2026 till 6:00 PM\nApplication Fee: Rs. 100/- via SBI net banking / official gateway.\nContact: facilitation@upsc.gov.in\nOfficial Portal: https://upsc.gov.in`);
      setUrlInput('https://upsc.gov.in');
    } else if (caseKey === 'case_2_suspicious_domain') {
      setActiveInputTab('text');
      setSourcePlatform('Social Media');
      setTextInput(`RAILWAY RECRUITMENT BOARDS (RRB)\nSPECIAL RECRUITMENT NOTIFICATION 2026\nCentralized Employment Notice CEN 09/2026-RAIL\n\nUrgent hiring for 12,500 Posts: Assistant Station Master, Ticket Collector.\nApply immediately. Last date is 24 hours only!\n100% selection guarantee without written examination.\n\nApply only on our portal: https://rrb-recruitment-gov.online\nRegistration Fee: Rs. 750 (Mandatory for slot confirmation)\nOfficial Email: rrb.support.desk@gmail.com\nHelpline: +918765432109`);
      setUrlInput('https://rrb-recruitment-gov.online');
    } else if (caseKey === 'case_3_personal_upi') {
      setActiveInputTab('text');
      setSourcePlatform('WhatsApp');
      setTextInput(`*INDIA POST RECRUITMENT CELL (GDS 2026)*\nMinistry of Communications, Government of India\n\nDirect Selection for 38,926 Gramin Dak Sevak across all postal circles!\nDirect appointment letter based on 10th marks. No exam!\n\nPay refundable security deposit of Rs. 500 immediately to confirm your appointment letter dispatch.\nPayment through UPI ID: recruitment.officer@okaxis\nSend payment screenshot to WhatsApp: +919876543210\n\nContact Person: Senior Recruitment Officer Sharma\nOfficial Mail: indiapost.gds.helpline@gmail.com\nPortal: https://indiapost-gds-apply.xyz`);
      setUrlInput('https://indiapost-gds-apply.xyz');
    } else if (caseKey === 'case_4_reused_infrastructure') {
      setActiveInputTab('text');
      setSourcePlatform('Telegram');
      setTextInput(`DEFENCE HEADQUARTERS RECRUITMENT BOARD\nGovt of India - Urgent Staff Recruitment 2026\n\nPosition: Multi-Tasking Staff (MTS) & Store Keeper\nNotice: Pay biometric document verification fee of Rs. 650.\nPay fee to authorized account UPI: recruitment.officer@okaxis\nMandatory: Call helpline +919876543210 after payment for biometric slot allocation.\n\nRecruitment Officer: Major V. K. Malhotra\nApply: https://example-recruitment-site.com\nOfficial Mail: defencerecruitment.cell@yahoo.com`);
      setUrlInput('https://example-recruitment-site.com');
    } else if (caseKey === 'sample_prompt_scenario') {
      setActiveInputTab('text');
      setSourcePlatform('SMS');
      setTextInput(`Government Recruitment 2026\nApply immediately.\nRegistration fee ₹500.\nContact recruitment@example.com\nPayment through UPI: fakegovt@upi\nWebsite: example-recruitment-site.com`);
      setUrlInput('https://example-recruitment-site.com');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedDemoKey(null);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (activeInputTab === 'text' && !textInput.trim() && !selectedDemoKey) {
      setErrorMessage("Please paste the recruitment message text or choose a demo scenario.");
      return;
    }
    if (activeInputTab === 'file' && !selectedFile) {
      setErrorMessage("Please select a screenshot (PNG/JPG) or recruitment PDF document.");
      return;
    }
    if (activeInputTab === 'url' && !urlInput.trim()) {
      setErrorMessage("Please enter a recruitment portal or application URL.");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Simulate multi-stage progress animation while request processes
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const formData = new FormData();
      formData.append('source_type', sourcePlatform);

      if (selectedDemoKey) {
        formData.append('demo_case_id', selectedDemoKey);
      }

      if (activeInputTab === 'text' || textInput) {
        formData.append('text', textInput);
      }
      if (urlInput) {
        formData.append('url', urlInput);
      }
      if (activeInputTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed with status ${res.status}`);
      }

      const analysisResult = await res.json();
      onAnalyzeSuccess(analysisResult);

    } catch (err) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || "An unexpected error occurred during analysis.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Recruitment Verification Engine
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
          Submit any suspicious Indian recruitment circular, WhatsApp forward, PDF notice, or website URL.
        </p>
      </div>

      {/* Demo Preset Selector Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
            <Sparkles size={16} />
            <span>Interactive Demo Scenarios:</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Click to auto-populate test cases</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleLoadDemo('case_1_genuine')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedDemoKey === 'case_1_genuine' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDemoKey === 'case_1_genuine' ? '#34d399' : '#cbd5e1',
              border: selectedDemoKey === 'case_1_genuine' ? '1px solid #10b981' : '1px solid var(--border-color)'
            }}
          >
            Case 1: Genuine UPSC (Pass)
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('case_2_suspicious_domain')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedDemoKey === 'case_2_suspicious_domain' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDemoKey === 'case_2_suspicious_domain' ? '#fbbf24' : '#cbd5e1',
              border: selectedDemoKey === 'case_2_suspicious_domain' ? '1px solid #f59e0b' : '1px solid var(--border-color)'
            }}
          >
            Case 2: Fake RRB .online (Scam)
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('case_3_personal_upi')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedDemoKey === 'case_3_personal_upi' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDemoKey === 'case_3_personal_upi' ? '#f87171' : '#cbd5e1',
              border: selectedDemoKey === 'case_3_personal_upi' ? '1px solid #ef4444' : '1px solid var(--border-color)'
            }}
          >
            Case 3: Fake GDS Personal UPI
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('case_4_reused_infrastructure')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedDemoKey === 'case_4_reused_infrastructure' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDemoKey === 'case_4_reused_infrastructure' ? '#f87171' : '#cbd5e1',
              border: selectedDemoKey === 'case_4_reused_infrastructure' ? '1px solid #ef4444' : '1px solid var(--border-color)'
            }}
          >
            Case 4: Reused Syndicate Infrastructure
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('sample_prompt_scenario')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedDemoKey === 'sample_prompt_scenario' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDemoKey === 'sample_prompt_scenario' ? '#a5b4fc' : '#cbd5e1',
              border: selectedDemoKey === 'sample_prompt_scenario' ? '1px solid #6366f1' : '1px solid var(--border-color)'
            }}
          >
            Case 5: Master Prompt Scenario
          </button>
        </div>
      </div>

      {/* Main Verification Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
        
        {/* Input Method Selector Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveInputTab('text'); setSelectedFile(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeInputTab === 'text' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeInputTab === 'text' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <FileText size={18} />
            <span>Paste Message / Text</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveInputTab('file'); setSelectedDemoKey(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeInputTab === 'file' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeInputTab === 'file' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Upload size={18} />
            <span>Upload Image / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveInputTab('url'); setSelectedFile(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeInputTab === 'url' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeInputTab === 'url' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Globe size={18} />
            <span>Recruitment Portal URL</span>
          </button>
        </div>

        {/* Tab 1: Text Input */}
        {activeInputTab === 'text' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Recruitment Notification Content / Message:
            </label>
            <textarea
              rows={9}
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setSelectedDemoKey(null); }}
              placeholder="Paste recruitment message from WhatsApp, Telegram circular, SMS notification, or advertisement text..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: '#f8fafc',
                fontSize: '14px',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {/* Tab 2: File Upload */}
        {activeInputTab === 'file' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Upload Recruitment Document (Image / Scanned PDF):
            </label>
            <div style={{
              border: '2px dashed rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(56, 189, 248, 0.03)',
              cursor: 'pointer'
            }}>
              <input 
                type="file" 
                id="file-upload" 
                accept=".png,.jpg,.jpeg,.pdf" 
                onChange={handleFileChange}
                style={{ display: 'none' }} 
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <Upload size={36} color="#38bdf8" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop file'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Supports PNG, JPG, JPEG, or PDF (Max 15MB)
                </div>
              </label>
            </div>
            {selectedFile && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: URL Input */}
        {activeInputTab === 'url' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Official Website / Recruitment Portal Link:
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setSelectedDemoKey(null); }}
              placeholder="e.g. https://upsc.gov.in or https://rrb-recruitment-gov.online"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {/* Source Platform Selector */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
            Source / Platform where received:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['WhatsApp', 'Telegram', 'SMS', 'Email', 'Social Media', 'Official Portal', 'Other'].map((platform) => (
              <button
                type="button"
                key={platform}
                onClick={() => setSourcePlatform(platform)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: sourcePlatform === platform ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: sourcePlatform === platform ? '#38bdf8' : '#94a3b8',
                  border: sourcePlatform === platform ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-color)'
                }}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button & Progress State */}
        {loading ? (
          <div style={{
            padding: '24px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <RefreshCw size={20} color="#38bdf8" className="pulse-anim" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>
                {analysisSteps[loadingStep]}
              </span>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((loadingStep + 1) / analysisSteps.length) * 100}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
              <span>Step {loadingStep + 1} of {analysisSteps.length}</span>
              <span>Running Evidence Reasoning Engine</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ fontSize: '15px', padding: '12px 32px' }}
            >
              <span>Verify Recruitment</span>
              <Send size={16} />
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
