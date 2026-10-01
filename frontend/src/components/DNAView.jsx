import React from 'react';
import { Dna, Building, FileText, Globe, Mail, Layers, CreditCard, Calendar } from 'lucide-react';

export default function DNAView({ dnaData, caseId }) {
  const fallbackDNA = {
    dna_id: 'DNA-DEMO-SAMPLE',
    similarity_score: 22.5,
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

  return (
    <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '18px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
              RECRUITMENT DNA GENOME
            </h2>
            <span className="badge badge-info">
              9-DIMENSIONAL DIGITAL FINGERPRINT
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Cross-verifies structural recruitment DNA signatures against official Indian Government gazette benchmarks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>CASE:</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{caseId || activeDNA.dna_id}</span>
        </div>
      </div>

      {/* Similarity & Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Similarity Score */}
        <div className="console-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700 }}>
            Official Gazette Alignment
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0' }}>
            <span style={{
              fontSize: '36px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: similarity >= 70 ? 'var(--color-success)' : similarity <= 35 ? 'var(--color-danger)' : 'var(--color-warning)'
            }}>
              {similarity.toFixed(1)}%
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
              {similarity >= 70 ? 'High Alignment' : similarity <= 35 ? 'Critical Divergence' : 'Partial Match'}
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: `${similarity}%`,
              height: '100%',
              backgroundColor: similarity >= 70 ? 'var(--color-success)' : similarity <= 35 ? 'var(--color-danger)' : 'var(--color-warning)'
            }} />
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Calculated across domain authority, statutory fee structures, and linguistic integrity.
          </div>
        </div>

        {/* Feature Summary */}
        <div className="console-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700 }}>
            Signature Classification Summary
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>Conforming Signatures</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{activeDNA.matching_features?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>Flagged / Divergent Vectors</span>
            <span style={{ color: 'var(--color-danger)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{activeDNA.mismatching_features?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>Missing Verifiable Records</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{activeDNA.missing_features?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* 9-Dimensional Breakdown Table */}
      <div className="console-card">
        <div className="console-card-header">
          <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
            9-DIMENSIONAL FEATURE BREAKDOWN
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SUBMITTED VS STATUTORY BENCHMARK
          </span>
        </div>

        <div style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <th style={{ padding: '10px 14px' }}>FEATURE / SIGNATURE</th>
                <th style={{ padding: '10px 14px' }}>SUBMITTED ARTIFACT</th>
                <th style={{ padding: '10px 14px' }}>OFFICIAL STATUTORY BENCHMARK</th>
                <th style={{ padding: '10px 14px' }}>STATUS</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>WEIGHT</th>
              </tr>
            </thead>
            <tbody>
              {(activeDNA.comparison_breakdown || []).map((row, idx) => {
                const isMatch = row.status === 'MATCH';
                const isMismatch = row.status === 'MISMATCH';
                let badgeClass = 'badge-neutral';
                if (isMatch) badgeClass = 'badge-success';
                else if (isMismatch) badgeClass = 'badge-danger';
                else badgeClass = 'badge-warning';

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-card-subtle)'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {row.feature_name}
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {row.category}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: isMismatch ? 'var(--color-danger)' : 'var(--text-heading)' }}>
                      {row.submitted_val}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {row.trusted_val}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${badgeClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {row.weight}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
