import React, { useState } from 'react';
import { Flag, X, Check, AlertCircle } from 'lucide-react';

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
          case_id: caseId,
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <Flag size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Report Case #{caseId}</h3>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Submit community feedback or cyber audit report</div>
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#34d399' }}>
            <Check size={36} style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Feedback Recorded Successfully</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Logged into TrustGraph Cyber Audit Trail</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Your Assessment Verdict:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['SCAM', 'SUSPICIOUS', 'GENUINE'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVerdict(v)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: verdict === v ? (v === 'SCAM' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)') : 'rgba(255, 255, 255, 0.05)',
                      color: verdict === v ? (v === 'SCAM' ? '#f87171' : '#34d399') : '#cbd5e1',
                      border: verdict === v ? (v === 'SCAM' ? '1px solid #ef4444' : '1px solid #10b981') : '1px solid var(--border-color)'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Forensic Notes / Observation:
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe why this case is fraudulent or verified (e.g. personal phone number requested ₹500 fee, fake joining letter format)..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: '#f8fafc',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: '13px' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '13px' }}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
