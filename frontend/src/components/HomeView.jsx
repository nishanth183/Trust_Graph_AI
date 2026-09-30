import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Upload, 
  Globe, 
  Dna, 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Lock,
  Layers
} from 'lucide-react';

export default function HomeView({ onStartVerification, onLoadDemoCase }) {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px 40px',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: '#38bdf8',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <Sparkles size={16} />
          <span>Core Principle: "We don't trust the message; we trust the evidence."</span>
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: 1.15,
          marginBottom: '20px'
        }}>
          Verify Fake Government Recruitment <br />
          <span className="gradient-text-cyan">Before You Trust</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Protect yourself and job seekers from fraudulent Indian civil service and PSU notices. 
          TrustGraph AI analyzes message text, circular PDFs, screenshots, and URLs using 
          <strong> Recruitment DNA</strong> and <strong>Evidence Graphs</strong>.
        </p>

        {/* Call to action & Input Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '48px'
        }}>
          <button
            onClick={() => onStartVerification()}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '14px 32px' }}
          >
            <span>Verify Recruitment Now</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onLoadDemoCase('case_1_genuine')}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '10px 14px' }}
            >
              Demo: Genuine UPSC
            </button>
            <button
              onClick={() => onLoadDemoCase('case_3_personal_upi')}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '10px 14px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            >
              Demo: Fake Postal UPI
            </button>
          </div>
        </div>

        {/* Input Types Supported Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          maxWidth: '960px',
          margin: '0 auto 60px'
        }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <FileText size={24} color="#38bdf8" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Pasted Text</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>WhatsApp messages, Telegram circulars, SMS job offers.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <Upload size={24} color="#a855f7" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Screenshot / Image</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>PNG, JPG, or poster scans with OpenCV image pre-processing.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <Layers size={24} color="#10b981" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Official PDF</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Scanned notices or digital circulars with QR code scanning.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
            <Globe size={24} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Portal URL</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Domain structure, SSL verification, and typosquatting checks.</p>
          </div>
        </div>
      </div>

      {/* How It Works - The 4-Stage Architecture */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            How TrustGraph AI Works
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
            Beyond simple keywords: Deep multi-stage verification and evidence reasoning.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '18px',
              marginBottom: '16px'
            }}>1</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Evidence Extraction</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Extracts claimed organization, notification number, fee, domain, email, phone, UPI handles, and embedded payment QR codes.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              fontWeight: 800,
              fontSize: '18px',
              marginBottom: '16px'
            }}>2</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Recruitment DNA</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Generates a 9-dimensional digital feature genome and calculates similarity against official UPSC, SSC, and Railway recruitment signatures.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              fontWeight: 800,
              fontSize: '18px',
              marginBottom: '16px'
            }}>3</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Evidence Graph</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Connects entities into an attributed knowledge graph to detect repeated scam phone numbers, UPI IDs, and fraudulent host domains.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '18px',
              marginBottom: '16px'
            }}>4</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Explainable Decision</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Produces a transparent verdict (Genuine, Suspicious, Scam, Inconclusive) with clear positive supporting vs negative risk evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Verdict Classifications Explained */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Understanding the 4 Verdicts</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <CheckCircle2 color="#10b981" size={20} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>GENUINE</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Matched active official gazette records, verified .gov.in/.nic.in domain, authorized banking fee channel, and statutory DNA profile.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AlertTriangle color="#f59e0b" size={20} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24' }}>SUSPICIOUS</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Unofficial aggregators, missing advertisement numbers, or moderate stylistic irregularities requiring manual portal verification.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <XCircle color="#ef4444" size={20} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>SCAM</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Severe contradictions detected: Personal UPI ID payment requests, fake .xyz/.online domains, guaranteed job claims, or reused scam syndicate numbers.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <HelpCircle color="#94a3b8" size={20} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#cbd5e1' }}>INCONCLUSIVE</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              The provided input lacks sufficient verifiable entities to confirm or refute. The system does not force an unverified claim.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Advisory Banner */}
      <div className="glass-card" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8'
          }}>
            <Lock size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Official Citizen Safety Tips
            </h3>
            <ul style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li><strong>Zero UPI Collection:</strong> Indian Central and State recruitment boards NEVER accept exam fees via personal UPI handles (e.g. <code>@okaxis</code>, <code>@paytm</code>) or direct WhatsApp QR codes.</li>
              <li><strong>Verify the Apex Domain:</strong> Official central and state government recruitment portals strictly use <code>.gov.in</code> or <code>.nic.in</code>. Beware of <code>.online</code>, <code>.xyz</code>, or <code>.com</code> spoof sites.</li>
              <li><strong>No Direct Appointment Without Merit:</strong> Public recruitment adheres strictly to competitive examinations. Any offer promising "100% Guaranteed Selection" or "No Exam Direct Joining" is fraudulent.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
