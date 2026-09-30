import React, { useState } from 'react';
import { 
  Dna, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  Calendar,
  CreditCard,
  Globe,
  Mail,
  Building,
  FileText
} from 'lucide-react';

export default function DNAView({ dnaData, caseId }) {
  const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' or 'genome'

  // Fallback demo DNA if no active analysis exists
  const fallbackDNA = {
    dna_id: 'DNA-DEMO-SAMPLE',
    similarity_score: 22.5,
    signatures: {
      organization_signature: { claimed_organization: 'Railway Recruitment Boards (RRB)', entity_normalized_id: '7b81...49f' },
      notification_signature: { notification_number: 'CEN 09/2026-RAIL', has_standard_format: true },
      domain_signature: { domain: 'rrb-recruitment-gov.online', tld: 'online', is_gov_in: false, is_suspicious_tld: true },
      contact_signature: { email: 'rrb.support.desk@gmail.com', is_public_mailbox: true, phone: '+918765432109' },
      visual_signature: { has_emblem_crest: true, qr_type: 'NONE' },
      writing_signature: { linguistic_style: 'COERCIVE_SCAM_STYLE', guaranteed_job_claim: true, nlp_risk_score: 85.0 },
      layout_signature: { format_type: 'UNOFFICIAL_CIRCULAR', has_tabular_vacancies: true },
      payment_signature: { has_application_fee: true, fee_amount: 750, is_personal_upi: false },
      temporal_signature: { deadline: '24 hours only', has_realistic_window: false }
    },
    matching_features: [
      'Conforms to formal notification indexing (CEN 09/2026-RAIL)'
    ],
    mismatching_features: [
      'Suspicious Unofficial Domain TLD: rrb-recruitment-gov.online',
      'Public free email provider used for official communications (@gmail.com)',
      'Contains deceptive 100% selection guarantee claims prohibited in civil service',
      'Immediate 24-hour expiration panic tactic'
    ],
    missing_features: [
      'No official government apex portal provided'
    ],
    comparison_breakdown: [
      { feature_name: 'Domain Authority', category: 'Domain Signature', submitted_val: 'rrb-recruitment-gov.online', trusted_val: '*.gov.in / *.nic.in', status: 'MISMATCH', weight: 25.0 },
      { feature_name: 'Payment Gateway', category: 'Payment Signature', submitted_val: 'Mandatory Slot Fee ₹750', trusted_val: 'Official Treasury / SBI e-Pay Portal', status: 'UNVERIFIED', weight: 25.0 },
      { feature_name: 'Official Email Domain', category: 'Contact Signature', submitted_val: 'rrb.support.desk@gmail.com', trusted_val: '@*.gov.in or @*.nic.in', status: 'MISMATCH', weight: 15.0 },
      { feature_name: 'Notification Indexing', category: 'Notification Signature', submitted_val: 'CEN 09/2026-RAIL', trusted_val: 'Standard Gazette Format', status: 'MATCH', weight: 15.0 },
      { feature_name: 'Linguistic Integrity', category: 'Writing Signature', submitted_val: 'Guaranteed 100% selection claim', trusted_val: 'Merit-based competitive exam guidelines', status: 'MISMATCH', weight: 10.0 },
      { feature_name: 'Application Window', category: 'Temporal Signature', submitted_val: '24 hours only', trusted_val: 'Standard 21-30 day filing window', status: 'MISMATCH', weight: 5.0 },
      { feature_name: 'Document QR Safety', category: 'Visual Signature', submitted_val: 'None', trusted_val: 'No standalone fee collection QR', status: 'MATCH', weight: 5.0 }
    ]
  };

  const activeDNA = (dnaData && dnaData.signatures) ? dnaData : fallbackDNA;
  const similarity = activeDNA.similarity_score || 0;

  const signatureIcons = {
    organization_signature: Building,
    notification_signature: FileText,
    domain_signature: Globe,
    contact_signature: Mail,
    visual_signature: Layers,
    writing_signature: FileText,
    layout_signature: Layers,
    payment_signature: CreditCard,
    temporal_signature: Calendar
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Recruitment DNA Profile</h1>
            <span className="badge badge-demo">9-Dimensional Genome</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            A structured digital feature representation comparing submitted notices against official Indian statutory patterns.
          </p>
        </div>

        {/* Genome ID Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          padding: '8px 16px',
          borderRadius: '8px'
        }}>
          <Dna size={18} color="#a855f7" />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 600 }}>
            {activeDNA.dna_id || 'DNA-GENOME-ACTIVE'}
          </span>
        </div>
      </div>

      {/* Similarity Score Card */}
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '32px',
        background: similarity > 70 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)' 
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: similarity > 70 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: similarity > 70 ? '#34d399' : '#f87171', textTransform: 'uppercase' }}>
              Statutory Recruitment Alignment
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>
              {similarity > 70 ? 'High Conformity with Official Guidelines' : 'Severe Divergence from Statutory DNA'}
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              Mathematical comparison across apex domain authority, fee collection mechanism, official email routing, and linguistic style.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: similarity > 70 ? '#34d399' : '#f87171', lineHeight: 1 }}>
              {similarity}%
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Official Pattern Similarity
            </div>
          </div>
        </div>

        {/* Genome Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          borderRadius: '5px',
          background: 'rgba(255, 255, 255, 0.1)',
          marginTop: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${similarity}%`,
            height: '100%',
            background: similarity > 70 ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #f87171, #ef4444)',
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={activeTab === 'breakdown' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '13px' }}
        >
          Attribute Comparison Matrix
        </button>
        <button
          onClick={() => setActiveTab('genome')}
          className={activeTab === 'genome' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '13px' }}
        >
          9 Digital Signatures (Raw Genome)
        </button>
      </div>

      {/* Tab 1: Detailed Comparison Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '12px 8px' }}>Dimension</th>
                <th style={{ padding: '12px 8px' }}>Submitted Value</th>
                <th style={{ padding: '12px 8px' }}>Official Government Standard</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {(activeDNA.comparison_breakdown || []).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 8px', fontWeight: 600, color: '#f8fafc' }}>
                    <div>{row.feature_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{row.category}</div>
                  </td>
                  <td style={{ padding: '14px 8px', color: '#cbd5e1', maxWidth: '240px', wordBreak: 'break-all' }}>
                    {String(row.submitted_val)}
                  </td>
                  <td style={{ padding: '14px 8px', color: '#94a3b8' }}>
                    {String(row.trusted_val)}
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    {row.status === 'MATCH' && (
                      <span className="badge badge-genuine">MATCH</span>
                    )}
                    {row.status === 'MISMATCH' && (
                      <span className="badge badge-scam">MISMATCH</span>
                    )}
                    {row.status === 'MISSING' && (
                      <span className="badge badge-inconclusive">MISSING</span>
                    )}
                    {row.status === 'UNVERIFIED' && (
                      <span className="badge badge-suspicious">UNVERIFIED</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                    {row.weight}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: 9 Digital Signatures Raw Genome */}
      {activeTab === 'genome' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(activeDNA.signatures || {}).map(([key, data]) => {
            const Icon = signatureIcons[key] || Dna;
            const title = key.replace('_signature', '').replace('_', ' ').toUpperCase();
            return (
              <div key={key} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{title} SIGNATURE</h3>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#cbd5e1' }}>
                  {Object.entries(data).map(([prop, val]) => (
                    <div key={prop} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>{prop}:</span>
                      <span style={{ color: typeof val === 'boolean' ? (val ? '#34d399' : '#f87171') : '#f8fafc', fontWeight: 600 }}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
