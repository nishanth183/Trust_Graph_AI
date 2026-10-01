import React from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Landmark, 
  ShieldAlert, 
  Check, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';

export default function HomeView({ onStartVerification, onLoadDemoCase }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '56px' }}>
      
      {/* Hero Section (Matching Screen 1 of Reference) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '48px',
        alignItems: 'center',
        padding: '24px 0'
      }}>
        
        {/* Left Hero Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-primary)',
            textTransform: 'uppercase'
          }}>
            CHECK BEFORE YOU TRUST
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)'
          }}>
            Got a government<br />job message?<br />
            <span style={{ color: 'var(--color-primary)' }}>Let's check it.</span>
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '480px'
          }}>
            Upload the message, screenshot, recruitment notice or website. TrustGraph AI will examine the available evidence and explain what we find.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
            <button
              onClick={onStartVerification}
              className="tg-btn-primary"
              style={{ padding: '14px 32px', fontSize: '16px' }}
            >
              <span>Check a Job Message</span>
              <ArrowRight size={18} />
            </button>

            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              It only takes a few seconds to start.
            </span>
          </div>

          {/* Quick Demo links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Demos:</span>
            <button
              onClick={() => onLoadDemoCase('demo_case_01')}
              className="tg-btn-ghost"
              style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: 'var(--bg-card-subtle)' }}
            >
              Genuine UPSC Notice
            </button>
            <button
              onClick={() => onLoadDemoCase('demo_case_02')}
              className="tg-btn-ghost"
              style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: 'var(--bg-card-subtle)' }}
            >
              Fake Postal Appointment
            </button>
          </div>
        </div>

        {/* Right Hero Graphic (Card with Pipeline Flow & Message Bubble) */}
        <div style={{ position: 'relative' }}>
          <div className="tg-card" style={{
            padding: '32px',
            position: 'relative',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-hover)'
          }}>
            
            {/* Suspicious Message Bubble Mock */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '16px 16px 16px 4px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              marginBottom: '28px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageSquare size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Congratulations!
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  You have been selected for a Government Job in Postal Department...
                </div>
              </div>
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}>
                !
              </div>
            </div>

            {/* Step-by-Step Flow Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
              
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: '22px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                backgroundColor: 'var(--border-subtle)',
                zIndex: 0
              }} />

              {/* Step 1: Message */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11px'
                }}>
                  TXT
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Message</span>
              </div>

              {/* Step 2: Evidence */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Search size={15} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Evidence</span>
              </div>

              {/* Step 3: Verification */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-info-bg)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={16} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Verification</span>
              </div>

              {/* Step 4: Result */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={16} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Result</span>
              </div>

            </div>

            {/* Architectural Civic Seal / Building Graphic */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}>
              <Landmark size={18} color="var(--color-primary)" />
              <span>Cross-verified with Indian Government Gazette Database (.gov.in)</span>
            </div>

          </div>
        </div>

      </div>

      {/* 3 Pillars of Evidence Verification */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        <div className="tg-card" style={{ padding: '24px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Landmark size={22} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Official Gazette Matching
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We cross-reference claimed notices, exam circular numbers, and department authority against the official government registry (`.gov.in` and `.nic.in`).
          </p>
        </div>

        <div className="tg-card" style={{ padding: '24px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={22} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Illegal Payment Detection
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Statutory recruitments never collect application fees or security deposits through personal UPI IDs (@okaxis, @paytm) or standalone QR codes.
          </p>
        </div>

        <div className="tg-card" style={{ padding: '24px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Evidence Before Trust
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            You receive an explainable Trust Score, a clear breakdown of warning factors, and guidance on how to report suspicious schemes to Cyber Helpline 1930.
          </p>
        </div>
      </div>

    </div>
  );
}
