import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Camera, 
  FileText, 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  X, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  FileDown, 
  Flag, 
  Sparkles, 
  RefreshCw, 
  Upload,
  Layers,
  Network
} from 'lucide-react';
import CytoscapeEvidenceGraph from './CytoscapeEvidenceGraph';

export default function CheckJobView({ 
  preloadedDemo, 
  onOpenReportModal, 
  initialResult,
  theme = 'light',
  authToken 
}) {
  // Step state: 1 = choose method, 2 = input details, 3 = loading, 4 = results
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('message'); // 'message', 'photo', 'pdf', 'website'

  // Input states
  const [messageText, setMessageText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourcePlatform, setSourcePlatform] = useState('WhatsApp');
  const [selectedDemoKey, setSelectedDemoKey] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAdvancedGraph, setShowAdvancedGraph] = useState(false);

  const fileInputRef = useRef(null);

  const scanSteps = [
    "Reading the submitted information",
    "Finding organization and contact details",
    "Checking available official sources",
    "Comparing recruitment details",
    "Preparing your result"
  ];

  // Pre-load demo presets
  const handleLoadDemo = (caseKey) => {
    setSelectedDemoKey(caseKey);
    setSelectedFile(null);
    setErrorMessage(null);
    setCurrentStep(2);

    if (caseKey === 'demo_case_01') {
      setSelectedMethod('message');
      setSourcePlatform('Official Portal');
      setMessageText(`UNION PUBLIC SERVICE COMMISSION\nEXAMINATION NOTICE NO. 05/2026-CSP\nCIVIL SERVICES (PRELIMINARY) EXAMINATION, 2026\n\nApply online: https://upsconline.nic.in\nLast date: 05th March, 2026 till 6:00 PM\nApplication Fee: Rs. 100/- via SBI net banking / official treasury gateway.\nContact: facilitation@upsc.gov.in\nOfficial Portal: https://upsc.gov.in`);
      setWebsiteUrl('https://upsc.gov.in');
    } else if (caseKey === 'demo_case_02') {
      setSelectedMethod('message');
      setSourcePlatform('WhatsApp');
      setMessageText(`*INDIA POST RECRUITMENT CELL (GDS 2026)*\nMinistry of Communications, Government of India\n\nDirect Selection for 38,926 Gramin Dak Sevak across all postal circles!\nDirect appointment letter based on 10th marks. No written examination!\n\nPay refundable security deposit of Rs. 500 immediately to confirm appointment letter dispatch.\nPayment through UPI ID: recruitment.officer@okaxis\nSend payment screenshot to WhatsApp: +919876543210\n\nContact Person: Senior Recruitment Officer Sharma\nOfficial Mail: indiapost.gds.helpline@gmail.com\nPortal: https://indiapost-gds-apply.xyz`);
      setWebsiteUrl('https://indiapost-gds-apply.xyz');
    } else if (caseKey === 'demo_case_rrb') {
      setSelectedMethod('message');
      setSourcePlatform('Social Media');
      setMessageText(`RAILWAY RECRUITMENT BOARDS (RRB)\nSPECIAL RECRUITMENT NOTIFICATION 2026\nCentralized Employment Notice CEN 09/2026-RAIL\n\nUrgent hiring for 12,500 Posts: Assistant Station Master, Ticket Collector.\nApply immediately. Last date is 24 hours only!\n100% selection guarantee without written examination.\n\nApply only on our portal: https://rrb-recruitment-gov.online\nRegistration Fee: Rs. 750 (Mandatory for slot confirmation)\nOfficial Email: rrb.support.desk@gmail.com\nHelpline: +918765432109`);
      setWebsiteUrl('https://rrb-recruitment-gov.online');
    }
  };

  useEffect(() => {
    if (preloadedDemo) {
      handleLoadDemo(preloadedDemo);
    }
  }, [preloadedDemo]);

  useEffect(() => {
    if (initialResult) {
      setAnalysisResult(initialResult);
      setCurrentStep(4);
    }
  }, [initialResult]);

  // Execute the verification
  const handleStartAnalysis = async () => {
    setErrorMessage(null);

    if (selectedMethod === 'message' && !messageText.trim() && !selectedDemoKey) {
      setErrorMessage("Please paste the message or choose an example.");
      return;
    }
    if ((selectedMethod === 'photo' || selectedMethod === 'pdf') && !selectedFile && !selectedDemoKey) {
      setErrorMessage(`Please upload a ${selectedMethod === 'photo' ? 'screenshot or photo' : 'PDF document'}.`);
      return;
    }
    if (selectedMethod === 'website' && !websiteUrl.trim() && !selectedDemoKey) {
      setErrorMessage("Please enter the website link to check.");
      return;
    }

    setCurrentStep(3);
    setLoading(true);
    setScanStepIndex(0);

    const stepInterval = setInterval(() => {
      setScanStepIndex(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 450);

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

      if (messageText) formData.append('text', messageText);
      if (websiteUrl) formData.append('url', websiteUrl);
      if (selectedFile) formData.append('file', selectedFile);

      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: formData
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Analysis failed with code ${res.status}`);
      }

      const result = await res.json();
      setAnalysisResult(result);

      setLoading(false);
      setCurrentStep(4);

    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      setErrorMessage(err.message || "Failed to analyze recruitment information.");
      setCurrentStep(2);
    }
  };

  const handleReset = () => {
    setMessageText('');
    setWebsiteUrl('');
    setSelectedFile(null);
    setSelectedDemoKey(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setCurrentStep(1);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* =========================================================================
          SCREEN 2: METHOD SELECTION
          ========================================================================= */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Check a Job
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              How did you receive the recruitment information?
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Card 1: Message */}
            <div 
              onClick={() => {
                setSelectedMethod('message');
                setCurrentStep(2);
              }}
              className="tg-card tg-card-interactive"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Message
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  WhatsApp, SMS,<br />Telegram or email
                </p>
              </div>
            </div>

            {/* Card 2: Photo */}
            <div 
              onClick={() => {
                setSelectedMethod('photo');
                setCurrentStep(2);
              }}
              className="tg-card tg-card-interactive"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Photo
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Upload a screenshot<br />or photo
                </p>
              </div>
            </div>

            {/* Card 3: PDF */}
            <div 
              onClick={() => {
                setSelectedMethod('pdf');
                setCurrentStep(2);
              }}
              className="tg-card tg-card-interactive"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  PDF
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Upload a recruitment<br />notice
                </p>
              </div>
            </div>

            {/* Card 4: Website */}
            <div 
              onClick={() => {
                setSelectedMethod('website');
                setCurrentStep(2);
              }}
              className="tg-card tg-card-interactive"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Website
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Paste the job<br />website link
                </p>
              </div>
            </div>

          </div>

          {/* Quick Example Presets bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
              Or try a ready-made case:
            </span>
            <button
              onClick={() => handleLoadDemo('demo_case_01')}
              className="tg-btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Genuine UPSC Circular
            </button>
            <button
              onClick={() => handleLoadDemo('demo_case_02')}
              className="tg-btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Fake Postal UPI Appointment
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          SCREEN 3: INPUT DETAILS SCREEN
          ========================================================================= */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Back button */}
          <button
            onClick={() => setCurrentStep(1)}
            className="tg-btn-ghost"
            style={{ alignSelf: 'flex-start', padding: '6px 10px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to choices</span>
          </button>

          {/* Main Input Card */}
          <div className="tg-card" style={{ padding: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedMethod === 'message' && <MessageSquare size={20} />}
                {selectedMethod === 'photo' && <Camera size={20} />}
                {selectedMethod === 'pdf' && <FileText size={20} />}
                {selectedMethod === 'website' && <Globe size={20} />}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedMethod === 'message' && 'Paste the message you received'}
                {selectedMethod === 'photo' && 'Upload the screenshot or photo'}
                {selectedMethod === 'pdf' && 'Upload the recruitment notification PDF'}
                {selectedMethod === 'website' && 'Enter the recruitment website link'}
              </h2>
            </div>

            {/* Input field based on selected method */}
            {selectedMethod === 'message' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Paste the WhatsApp, SMS, Telegram or email message here..."
                  className="tg-textarea"
                  rows={8}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  You don't need to remove anything. We'll check it for you.
                </span>
              </div>
            )}

            {selectedMethod === 'photo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) setSelectedFile(f); }}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--color-primary)' : selectedFile ? 'var(--color-success)' : 'var(--border-card)'}`,
                    borderRadius: '12px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: selectedFile ? 'var(--color-success-bg)' : dragActive ? 'var(--color-primary-light)' : 'var(--bg-card-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    key="photo-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                    accept="image/png,image/jpeg,image/jpg"
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: selectedFile ? 'var(--color-success)' : 'var(--color-success-bg)',
                      color: selectedFile ? 'white' : 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {selectedFile ? <Check size={26} /> : <Camera size={24} />}
                    </div>
                    {selectedFile ? (
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-success)' }}>
                          ✓ Photo ready for analysis
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Click to change file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          Click or drag &amp; drop a photo / screenshot
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          PNG, JPG, JPEG — appointment letters, posters, WhatsApp screenshots
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedFile && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={15} color="var(--color-success)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>{selectedFile.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="tg-btn-ghost" style={{ padding: '2px 6px' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px', lineHeight: 1.5 }}>
                  <strong>Note:</strong> Our system reads text from the image using OCR. For best results, upload a clear, legible photo. If text cannot be read, the analysis will note "no readable text" and return an inconclusive result.
                </div>
              </div>
            )}

            {selectedMethod === 'pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: '2px dashed var(--border-card)',
                    borderRadius: '12px',
                    padding: '44px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-card-subtle)'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    accept="application/pdf"
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-warning-bg)',
                      color: 'var(--color-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={24} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      Click to select recruitment notice PDF
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Scanned or digital government notifications (PDF)
                    </span>
                  </div>
                </div>

                {selectedFile && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="tg-btn-ghost" style={{ padding: '2px 6px' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === 'website' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example-recruitment-site.com"
                  className="tg-input"
                  style={{ height: '48px' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  We'll check if this website matches the official apex government registry.
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bottom Actions: Examples on left, Check Button on right */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleLoadDemo('demo_case_02')}
                  className="tg-btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  <Sparkles size={14} color="var(--color-primary)" />
                  <span>Try an example</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="tg-btn-primary"
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                <span>
                  {selectedMethod === 'photo' ? 'Analyse Photo' :
                   selectedMethod === 'pdf' ? 'Analyse PDF' :
                   selectedMethod === 'website' ? 'Check Website' :
                   'Check Message'}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          SCREEN 4: SCANNING / LOADING SCREEN
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="tg-card" style={{ padding: '60px 32px', textAlign: 'center', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
          
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            position: 'relative'
          }}>
            <Search size={38} className="animate-spin" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            We're checking the details...
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            This may take a moment.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textAlign: 'left',
            maxWidth: '360px',
            margin: '0 auto'
          }}>
            {scanSteps.map((step, idx) => {
              const isDone = idx < scanStepIndex;
              const isCurrent = idx === scanStepIndex;

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--bg-card-subtle)',
                    color: isDone || isCurrent ? '#FFFFFF' : 'var(--text-dimmed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isDone ? '✓' : isCurrent ? '●' : '○'}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontWeight: isCurrent ? 700 : 500
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          SCREEN 5, 6, 7, 8: RESULT DASHBOARD (YOUR CHECK IS COMPLETE)
          ========================================================================= */}
      {currentStep === 4 && analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Return / Header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ← YOUR CHECK IS COMPLETE
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`/api/report/${analysisResult?.case_id}/download`}
                download={`TrustGraph_Report_${analysisResult?.case_id}.pdf`}
                className="tg-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileDown size={14} />
                <span>Save PDF Report</span>
              </a>
              <button
                onClick={handleReset}
                className="tg-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <RefreshCw size={14} />
                <span>Check Another Message</span>
              </button>
            </div>
          </div>

          {/* OCR Notice: shown when image had no readable text */}
          {analysisResult.input_metadata?.input_type === 'FILE_IMAGE' &&
           analysisResult.input_metadata?.raw_text_preview?.toLowerCase().includes('no readable text') && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              color: 'var(--text-primary)'
            }}>
              <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Image uploaded — No text could be extracted.</strong><br />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Our OCR system could not read text from your image (this usually happens when the image is blurry, handwritten, or not a recruitment document). The result below is based on the image file alone and is inconclusive. Try pasting the text from the message instead for a more accurate analysis.
                </span>
              </div>
            </div>
          )}


          <div className="tg-card" style={{
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            borderLeft: `8px solid ${analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger)' : 'var(--color-warning)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: analysisResult.verdict === 'GENUINE' ? 'var(--color-success-bg)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                color: analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger)' : 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {analysisResult.verdict === 'GENUINE' ? <Check size={28} /> : analysisResult.verdict === 'SCAM' ? <AlertCircle size={28} /> : <AlertTriangle size={28} />}
              </div>

              <div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : analysisResult.verdict === 'SCAM' ? 'var(--color-danger)' : 'var(--color-warning)'
                }}>
                  {analysisResult.verdict === 'GENUINE' ? 'VERIFIED GENUINE'
                   : analysisResult.verdict === 'SCAM' ? 'CONFIRMED HIGH RISK'
                   : analysisResult.verdict === 'SUSPICIOUS' ? 'SUSPICIOUS — VERIFY CAREFULLY'
                   : 'INCONCLUSIVE — INSUFFICIENT DATA'}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {analysisResult.verdict === 'GENUINE'
                    ? 'This recruitment circular matches authentic Indian Government Gazette records.'
                    : analysisResult.verdict === 'SCAM'
                    ? 'This recruitment message has significant warning signs and suspicious payment requests. Do not pay.'
                    : analysisResult.verdict === 'SUSPICIOUS'
                    ? 'Several indicators are irregular. Cross-check with official government portals before proceeding.'
                    : 'Not enough information was extracted to give a definitive verdict. See details below.'}
                </p>
              </div>
            </div>

            {/* Circular Donut Trust Score Gauge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 20px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              {analysisResult.verdict === 'INCONCLUSIVE' ? (
                /* Cannot determine score — not enough data */
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Trust Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      —
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                      Can't determine score
                    </div>
                  </div>
                  {/* Grey empty ring */}
                  <div style={{ position: 'relative', width: '48px', height: '48px', opacity: 0.3 }}>
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="18" fill="none" stroke="var(--border-subtle)" strokeWidth="4" strokeDasharray="4 4" />
                    </svg>
                  </div>
                </div>
              ) : (
                /* Normal scored result */
                <>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Trust Score
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {analysisResult.trust_score} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
                    </div>
                  </div>
                  {/* Donut progress ring */}
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="24" cy="24" r="18" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="none"
                        stroke={analysisResult.trust_score >= 70 ? 'var(--color-success)' : analysisResult.trust_score <= 35 ? 'var(--color-danger)' : 'var(--color-warning)'}
                        strokeWidth="4"
                        strokeDasharray="113"
                        strokeDashoffset={113 - (113 * Math.min(100, analysisResult.trust_score)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. "Why?" 4-Card Summary Grid (Screen 5) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Why?
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}>
              {/* Payment Card */}
              <div className="tg-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`tg-pill ${analysisResult.extracted_evidence?.payment_requested ? 'tg-pill-warning' : 'tg-pill-verified'}`}>
                    {analysisResult.extracted_evidence?.payment_requested ? '✕' : '✓'} Payment Request
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {analysisResult.extracted_evidence?.payment_requested
                    ? `The message asks applicants to pay a fee (${analysisResult.extracted_evidence.upi_id || 'unauthorized account'}).`
                    : 'No unauthorized fee solicitation or personal UPI detected.'}
                </p>
              </div>

              {/* Website Card */}
              <div className="tg-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`tg-pill ${analysisResult.verification_details?.domain_status === 'VERIFIED' ? 'tg-pill-verified' : 'tg-pill-caution'}`}>
                    {analysisResult.verification_details?.domain_status === 'VERIFIED' ? '✓' : '⚠'} Website Domain
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {analysisResult.verification_details?.domain_status === 'VERIFIED'
                    ? 'Host domain is verified under official government apex registry.'
                    : 'The website could not be matched with official government .gov.in records.'}
                </p>
              </div>

              {/* Contact Card */}
              <div className="tg-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`tg-pill ${analysisResult.verification_details?.phone_status === 'VERIFIED' ? 'tg-pill-verified' : 'tg-pill-caution'}`}>
                    {analysisResult.verification_details?.phone_status === 'VERIFIED' ? '✓' : '⚠'} Contact Channel
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {analysisResult.extracted_evidence?.phone
                    ? 'Uses personal WhatsApp or non-government mobile communication.'
                    : 'No suspicious personal contact numbers identified.'}
                </p>
              </div>

              {/* Organization Card */}
              <div className="tg-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`tg-pill ${analysisResult.extracted_evidence?.organization ? 'tg-pill-verified' : 'tg-pill-caution'}`}>
                    {analysisResult.extracted_evidence?.organization ? '✓' : '⚠'} Organization
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {analysisResult.extracted_evidence?.organization
                    ? `Claimed department: "${analysisResult.extracted_evidence.organization}".`
                    : 'Could not detect an authoritative government recruitment department.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. "What should you do?" Advice Callout Box (Screen 5) */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '20px 24px',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: '12px'
          }}>
            <AlertTriangle size={24} color="var(--color-warning-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-warning-text)' }}>
                What should you do?
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-warning-text)', marginTop: '4px', lineHeight: 1.5 }}>
                {analysisResult.recommended_action || 'Do not send money, UPI transfers, or personal identification documents until you verify this vacancy through the official government portal (.gov.in).'}
              </p>
            </div>
          </div>

          {/* 4. "Evidence found" List (Screen 6) */}
          <div className="tg-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Search size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Evidence found
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Here is what we extracted while checking the recruitment information.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const ev = analysisResult.extracted_evidence || {};
                const verif = analysisResult.verification_details || {};
                const domain = (ev.domain || '').toLowerCase();
                const isGovDomain = domain.endsWith('.gov.in') || domain.endsWith('.nic.in');
                const email = (ev.email || '').toLowerCase();
                const isGovEmail = email.endsWith('.gov.in') || email.endsWith('.nic.in');
                const isPublicEmail = email.includes('@gmail.com') || email.includes('@yahoo.com') || email.includes('@outlook.com');
                const phone = ev.phone || '';
                const isLandline = phone.startsWith('011') || phone.startsWith('022');
                const upi = ev.upi_id;
                const isUnauthPay = ev.is_unauthorized_payment;
                const fee = ev.application_fee;
                const notif = ev.notification_number;
                const org = ev.organization;
                const isOrgMatch = verif.organization_status === 'VERIFIED' || (org && !org.toLowerCase().includes('unspecified'));

                // Payment details computation
                let payValue = 'No application fee required';
                let payLabel = 'Verified';
                let payType = 'tg-pill-verified';
                if (upi) {
                  payValue = `Personal UPI collection: ${upi}`;
                  payLabel = 'Warning';
                  payType = 'tg-pill-warning';
                } else if (isUnauthPay) {
                  payValue = ev.payment_pattern || 'Unauthorized fee or personal deposit requested';
                  payLabel = 'Warning';
                  payType = 'tg-pill-warning';
                } else if (fee && isGovDomain) {
                  payValue = `Official treasury gateway: ₹${fee}`;
                  payLabel = 'Verified';
                  payType = 'tg-pill-verified';
                } else if (fee) {
                  payValue = `Application fee: ₹${fee}`;
                  payLabel = 'Needs checking';
                  payType = 'tg-pill-caution';
                }

                return [
                  {
                    label: 'Organization',
                    value: org || 'Not identified in notice',
                    pillLabel: isOrgMatch ? 'Verified' : (org ? 'Needs checking' : 'Warning'),
                    pillType: isOrgMatch ? 'tg-pill-verified' : (org ? 'tg-pill-caution' : 'tg-pill-warning')
                  },
                  {
                    label: 'Website Domain',
                    value: domain || 'No website link provided',
                    pillLabel: isGovDomain ? 'Verified' : (domain ? 'Needs checking' : 'Needs checking'),
                    pillType: isGovDomain ? 'tg-pill-verified' : (domain ? 'tg-pill-warning' : 'tg-pill-caution')
                  },
                  {
                    label: 'Phone Number',
                    value: phone || 'Not provided',
                    pillLabel: isLandline ? 'Verified' : (phone ? 'Not verified' : 'Neutral'),
                    pillType: isLandline ? 'tg-pill-verified' : (phone ? 'tg-pill-warning' : 'tg-pill-neutral')
                  },
                  {
                    label: 'Email',
                    value: email || 'Not provided',
                    pillLabel: isGovEmail ? 'Verified' : (isPublicEmail ? 'Warning' : (email ? 'Needs checking' : 'Neutral')),
                    pillType: isGovEmail ? 'tg-pill-verified' : (isPublicEmail ? 'tg-pill-warning' : 'tg-pill-neutral')
                  },
                  {
                    label: 'Recruitment Notice',
                    value: notif || 'No matching official gazette index',
                    pillLabel: notif ? 'Verified' : 'Warning',
                    pillType: notif ? 'tg-pill-verified' : 'tg-pill-warning'
                  },
                  {
                    label: 'Payment Request',
                    value: payValue,
                    pillLabel: payLabel,
                    pillType: payType
                  }
                ];
              })().map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                  <span className={`tg-pill ${item.pillType}`}>
                    {item.pillLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Evidence Graph Visual Tree (Screen 7 with dynamic connecting wires) */}
          <div className="tg-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Evidence Graph
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  See how the different pieces of information are connected.
                </p>
              </div>

              <button
                onClick={() => setShowAdvancedGraph(prev => !prev)}
                className="tg-btn-secondary"
                style={{ fontSize: '12px' }}
              >
                <Network size={14} />
                <span>{showAdvancedGraph ? 'Show Simple View' : 'View Full Interactive Graph'}</span>
              </button>
            </div>

            {/* Tree or Interactive Cytoscape Graph */}
            {showAdvancedGraph ? (
              <div style={{ marginTop: '16px' }}>
                <CytoscapeEvidenceGraph
                  graphData={analysisResult.evidence_graph}
                  caseId={analysisResult.case_id}
                  theme={theme}
                />
              </div>
            ) : (
              /* Clean Civic Tree diagram with SVG wires matching Screen 7 */
              (() => {
                const ev = analysisResult.extracted_evidence || {};
                const verif = analysisResult.verification_details || {};
                const domain = (ev.domain || '').toLowerCase();
                const isGovDomain = domain.endsWith('.gov.in') || domain.endsWith('.nic.in');
                const email = (ev.email || '').toLowerCase();
                const isGovEmail = email.endsWith('.gov.in') || email.endsWith('.nic.in');
                const isPublicEmail = email.includes('@gmail.com') || email.includes('@yahoo.com') || email.includes('@outlook.com');
                const upi = ev.upi_id;
                const isUnauthPay = ev.is_unauthorized_payment;
                const notif = ev.notification_number;
                const org = ev.organization;
                const isOrgMatch = verif.organization_status === 'VERIFIED' || (org && !org.toLowerCase().includes('unspecified'));
                const phone = ev.phone || '';
                const isLandline = phone.startsWith('011') || phone.startsWith('022');

                const graphNodes = [
                  {
                    label: 'Organization',
                    color: isOrgMatch ? '#10B981' : (org ? '#F59E0B' : '#EF4444'),
                    statusText: org || 'Organization'
                  },
                  {
                    label: 'Website Domain',
                    color: isGovDomain ? '#10B981' : (domain ? '#EF4444' : '#F59E0B'),
                    statusText: domain || 'Domain'
                  },
                  {
                    label: 'Phone Number',
                    color: isLandline ? '#10B981' : (phone ? '#EF4444' : '#94A3B8'),
                    statusText: phone || 'Phone'
                  },
                  {
                    label: 'Email',
                    color: isGovEmail ? '#10B981' : (isPublicEmail ? '#EF4444' : (email ? '#F59E0B' : '#94A3B8')),
                    statusText: email || 'Email'
                  },
                  {
                    label: 'Recruitment Notice',
                    color: notif ? '#10B981' : '#EF4444',
                    statusText: notif || 'Gazette Index'
                  },
                  {
                    label: 'Payment Account',
                    color: (upi || isUnauthPay) ? '#EF4444' : '#10B981',
                    statusText: upi || 'Payment'
                  }
                ];

                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, 160px) minmax(70px, 120px) minmax(180px, 220px) minmax(70px, 120px) minmax(170px, 200px)',
                    alignItems: 'center',
                    padding: '28px 16px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '12px',
                    overflowX: 'auto',
                    minWidth: '660px'
                  }}>
                    {/* Node 1: Job Message Card */}
                    <div style={{
                      padding: '16px 18px',
                      backgroundColor: 'var(--bg-card)',
                      border: '2px solid var(--color-primary)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: 'var(--shadow-xs)'
                    }}>
                      <MessageSquare size={20} color="var(--color-primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Job Message</span>
                    </div>

                    {/* Node 2: Left Branching SVG Wires */}
                    <svg viewBox="0 0 100 240" preserveAspectRatio="none" style={{ width: '100%', height: '240px', overflow: 'visible' }}>
                      {graphNodes.map((node, i) => {
                        const y = 20 + i * 40;
                        return (
                          <g key={i}>
                            <path
                              d={`M 0 120 C 45 120, 55 ${y}, 100 ${y}`}
                              fill="none"
                              stroke={node.color}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                            <circle cx="0" cy="120" r="3.5" fill="var(--color-primary)" />
                            <circle cx="100" cy={y} r="3" fill={node.color} />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Node 3: Center Stack of Entity Nodes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {graphNodes.map((node, i) => (
                        <div
                          key={i}
                          style={{
                            height: '32px',
                            padding: '0 12px',
                            backgroundColor: 'var(--bg-card)',
                            border: `1.5px solid ${node.color}40`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: node.color, flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Node 4: Right Converging SVG Wires */}
                    <svg viewBox="0 0 100 240" preserveAspectRatio="none" style={{ width: '100%', height: '240px', overflow: 'visible' }}>
                      {graphNodes.map((node, i) => {
                        const y = 20 + i * 40;
                        return (
                          <g key={i}>
                            <path
                              d={`M 0 ${y} C 45 ${y}, 55 120, 100 120`}
                              fill="none"
                              stroke={node.color}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                            <circle cx="0" cy={y} r="3" fill={node.color} />
                            <circle cx="100" cy="120" r="3.5" fill={analysisResult.verdict === 'GENUINE' ? '#10B981' : '#EF4444'} />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Node 5: Risk Assessment Card */}
                    <div style={{
                      padding: '16px 18px',
                      backgroundColor: analysisResult.verdict === 'GENUINE' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                      border: `2px solid ${analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: 'var(--shadow-xs)'
                    }}>
                      <AlertCircle size={22} color={analysisResult.verdict === 'GENUINE' ? 'var(--color-success)' : 'var(--color-danger)'} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: analysisResult.verdict === 'GENUINE' ? 'var(--color-success-text)' : 'var(--color-danger-text)', lineHeight: 1.2 }}>
                          {analysisResult.verdict === 'GENUINE' ? 'Official Match' : 'Multiple Warning Signs'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Risk Assessment
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* 6. Recruitment Pattern (DNA) Section (Screen 8 - 100% Dynamic & Accurate) */}
          <div className="tg-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Recruitment Pattern
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Does this recruitment look like the organization's normal process?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                // Check if recruitment_pattern is already provided by backend
                if (analysisResult.recruitment_pattern && Array.isArray(analysisResult.recruitment_pattern) && analysisResult.recruitment_pattern.length > 0) {
                  return analysisResult.recruitment_pattern;
                }
                if (analysisResult.recruitment_dna?.pattern_checklist && Array.isArray(analysisResult.recruitment_dna.pattern_checklist) && analysisResult.recruitment_dna.pattern_checklist.length > 0) {
                  return analysisResult.recruitment_dna.pattern_checklist;
                }

                // Dynamic extraction from analysisResult
                const ev = analysisResult.extracted_evidence || {};
                const verif = analysisResult.verification_details || {};
                const nlp = analysisResult.nlp_analysis || {};

                // 1. Organization
                const org = ev.organization || '';
                const isOrgMatch = verif.organization_status === 'VERIFIED' || (org && !org.toLowerCase().includes('unspecified'));
                const orgRow = {
                  feature: 'Organization Name',
                  detail: org ? `${org}` : 'No authoritative government organization identified',
                  status: isOrgMatch ? 'Match' : (org ? 'Partial match' : 'Mismatch'),
                  type: isOrgMatch ? 'tg-pill-verified' : (org ? 'tg-pill-caution' : 'tg-pill-warning')
                };

                // 2. Website
                const domain = (ev.domain || '').toLowerCase();
                const isGov = domain.endsWith('.gov.in') || domain.endsWith('.nic.in');
                const isSusp = domain && !isGov;
                const webRow = {
                  feature: 'Website',
                  detail: isGov
                    ? `Official government portal verified (${domain})`
                    : (isSusp ? `Suspicious non-government portal (${domain} — Expected .gov.in)` : 'No official website provided in notice'),
                  status: isGov ? 'Match' : (isSusp ? 'Mismatch' : 'Needs checking'),
                  type: isGov ? 'tg-pill-verified' : (isSusp ? 'tg-pill-warning' : 'tg-pill-caution')
                };

                // 3. Application Process
                const hasDirect = ev.has_direct_selection || nlp.guaranteed_job_claim;
                const procRow = {
                  feature: 'Application Process',
                  detail: hasDirect
                    ? 'Direct selection claims without exam / 100% guarantee (Illegal)'
                    : 'Standard statutory merit-based competitive process',
                  status: hasDirect ? 'Mismatch' : 'Match',
                  type: hasDirect ? 'tg-pill-warning' : 'tg-pill-verified'
                };

                // 4. Contact Method
                const phone = ev.phone || '';
                const email = (ev.email || '').toLowerCase();
                const isPublicMail = email.includes('@gmail.com') || email.includes('@yahoo.com') || email.includes('@outlook.com');
                const isWhatsApp = phone.startsWith('+91') && !phone.startsWith('011');
                const contactRow = {
                  feature: 'Contact Method',
                  detail: (isPublicMail || isWhatsApp)
                    ? `Personal contact channel: ${isWhatsApp ? `WhatsApp (${phone})` : ''} ${isPublicMail ? `Public email (${email})` : ''}`.trim()
                    : (email.endsWith('.gov.in') || phone.startsWith('011') ? `Official contact verified: ${email || phone}` : 'No verified institutional helpdesk provided'),
                  status: isPublicMail ? 'Mismatch' : (isWhatsApp ? 'Needs checking' : 'Match'),
                  type: isPublicMail ? 'tg-pill-warning' : (isWhatsApp ? 'tg-pill-caution' : 'tg-pill-verified')
                };

                // 5. Notice Format
                const notif = ev.notification_number || '';
                const hasNotifIndex = notif && (notif.includes('/') || notif.includes('-') || notif.includes('.'));
                const notifRow = {
                  feature: 'Notice Format',
                  detail: hasNotifIndex
                    ? `Standard gazette CEN format indexing (${notif})`
                    : (notif ? `Circular reference number (${notif})` : 'Informal notification lacking gazette circular index'),
                  status: hasNotifIndex ? 'Match' : 'Partial match',
                  type: hasNotifIndex ? 'tg-pill-verified' : 'tg-pill-caution'
                };

                // 6. Payment Pattern
                const upi = ev.upi_id;
                const isUnauthPay = ev.is_unauthorized_payment;
                const fee = ev.application_fee;
                const payRow = {
                  feature: 'Payment Pattern',
                  detail: upi
                    ? `Personal UPI fee collection (${upi})`
                    : (isUnauthPay ? 'Unauthorized fee or personal security deposit' : (fee && isGov ? `Official treasury gateway (₹${fee})` : (fee ? `Fee requested (₹${fee})` : 'No application fee required'))),
                  status: (upi || isUnauthPay) ? 'Mismatch' : 'Match',
                  type: (upi || isUnauthPay) ? 'tg-pill-warning' : 'tg-pill-verified'
                };

                return [orgRow, webRow, procRow, contactRow, notifRow, payRow];
              })().map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.feature}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.detail}</div>
                  </div>
                  <span className={`tg-pill ${row.type}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
            <button
              onClick={handleReset}
              className="tg-btn-primary"
              style={{ padding: '12px 32px' }}
            >
              <span>Check Another Message</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onOpenReportModal && onOpenReportModal(analysisResult.case_id)}
              className="tg-btn-secondary"
            >
              <Flag size={14} />
              <span>Flag as Scam</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
