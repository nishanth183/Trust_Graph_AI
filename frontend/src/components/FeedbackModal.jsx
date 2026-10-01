import React, { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, caseId }) {
  const [verdict, setVerdict] = useState('SCAM');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId || 'TG-2026-00128',
          user_verdict: verdict,
          feedback_notes: notes,
          reporter_contact: contact
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="console-card" style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Modal Header */}
        <div className="console-card-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flag size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                FLAG CASE AUDIT REPORT
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CASE ID: {caseId || 'TG-2026-00128'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-success)' }}>
              <Check size={38} style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                AUDIT FEEDBACK REGISTERED
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Logged into TrustGraph Cyber Forensics Evidence Registry
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Forensic Assessment Verdict:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['SCAM', 'SUSPICIOUS', 'GENUINE'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVerdict(v)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: verdict === v ? (v === 'SCAM' ? 'var(--color-danger-bg)' : v === 'GENUINE' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)') : 'var(--bg-card-subtle)',
                        color: verdict === v ? (v === 'SCAM' ? 'var(--color-danger)' : v === 'GENUINE' ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--text-muted)',
                        border: verdict === v ? (v === 'SCAM' ? '1px solid var(--color-danger)' : v === 'GENUINE' ? '1px solid var(--color-success)' : '1px solid var(--color-warning)') : '1px solid var(--border-subtle)'
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Forensic Observation / Evidence Notes:
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record reasons for this evaluation (e.g. personal UPI request, unauthorized domain registrar, fake appointment letter)..."
                  className="form-textarea"
                  style={{ minHeight: '90px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Investigator / Citizen Contact (Optional):
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Official email or verification ticket ID"
                  className="form-input"
                  style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {loading ? 'Registering...' : 'Register Audit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
