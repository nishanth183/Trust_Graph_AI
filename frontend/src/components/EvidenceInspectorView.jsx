import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, XCircle, FileText, Globe, Phone, Mail, CreditCard, ExternalLink } from 'lucide-react';

export default function EvidenceInspectorView({ activeResult }) {
  const sampleEvidence = {
    case_id: 'TG-2026-DEMO-002',
    verdict: 'SCAM',
    extracted_evidence: {
      organization: 'India Post Recruitment Cell (GDS)',
      notification_number: 'GDS/RECT/2026-DIRECT',
      domain: 'indiapost-gds-apply.xyz',
      phone: '+919876543210',
      email: 'indiapost.gds.helpline@gmail.com',
      payment_requested: true,
      application_fee: 500,
      upi_id: 'recruitment.officer@okaxis',
      qr_code_detected: true
    },
    verification_details: {
      organization_status: 'SUSPICIOUS',
      domain_status: 'CONFLICT',
      phone_status: 'CONFLICT',
      email_status: 'CONFLICT',
      official_portal: 'https://indiapost.gov.in'
    },
    contradiction_findings: [
      {
        severity: 'CRITICAL',
        category: 'Payment Channel',
        title: 'Personal UPI Payment Demand',
        description: 'Direct fee solicitation via personal UPI handle "recruitment.officer@okaxis". Statutory recruitment requires RBI/Treasury e-payment.'
      },
      {
        severity: 'CRITICAL',
        category: 'Domain Authority',
        title: 'Typosquatted Non-Government Domain',
        description: 'Host domain "indiapost-gds-apply.xyz" lacks .gov.in / .nic.in government apex authorization.'
      },
      {
        severity: 'HIGH',
        category: 'Contact Channel',
        title: 'Public Mailbox Used for Official Notice',
        description: 'Email provider @gmail.com used instead of authorized NIC mail server (@indiapost.gov.in).'
      }
    ]
  };

  const data = activeResult || sampleEvidence;
  const ev = data.extracted_evidence || {};
  const ver = data.verification_details || {};
  const contradictions = data.contradiction_findings || [];

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
              FORENSIC EVIDENCE MATRIX
            </h2>
            <span className="badge badge-info">
              RAW VECTOR EXTRACTION
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Structured breakdown of extracted recruitment entities, government domain registries, and institutional conflict vectors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>CASE:</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{data.case_id}</span>
        </div>
      </div>

      {/* Grid of Evidence Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {/* Panel 1: Extracted Entity Credentials */}
        <div className="console-card">
          <div className="console-card-header">
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
              ENTITY CREDENTIAL MATRIX
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PRIMARY ARTIFACTS
            </span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Claimed Organization', val: ev.organization || 'None', icon: FileText },
              { label: 'Gazette Reference No', val: ev.notification_number || 'Missing / Not indexed', icon: FileText },
              { label: 'Target Portal URL', val: ev.domain || 'Not specified', icon: Globe },
              { label: 'Contact Phone Number', val: ev.phone || 'None provided', icon: Phone },
              { label: 'Contact Email Address', val: ev.email || 'None provided', icon: Mail },
              { label: 'Application Fee', val: ev.application_fee ? `₹${ev.application_fee}` : 'No fee stated', icon: CreditCard },
              { label: 'Direct UPI Address', val: ev.upi_id || 'No UPI detected', icon: CreditCard }
            ].map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Icon size={14} color="var(--accent-primary)" />
                    <span>{row.label}</span>
                  </div>
                  <span style={{
                    color: 'var(--text-heading)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    maxWidth: '200px',
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {row.val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Official Registry Cross-Examination */}
        <div className="console-card">
          <div className="console-card-header">
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
              OFFICIAL REGISTRY CROSS-EXAMINATION
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              GAZETTE BENCHMARK
            </span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                VERIFIED APEX PORTAL
              </span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {ver.official_portal || 'https://upsc.gov.in | https://ssc.gov.in'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Organization Verification', status: ver.organization_status || 'UNVERIFIED' },
                { label: 'Domain Authorization (.gov.in / .nic.in)', status: ver.domain_status || 'CONFLICT' },
                { label: 'Official Mailbox Authorization', status: ver.email_status || 'CONFLICT' },
                { label: 'Helpline Contact Registration', status: ver.phone_status || 'CONFLICT' }
              ].map((item, idx) => {
                const isPass = item.status === 'VERIFIED' || item.status === 'DEMO VERIFIED';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      backgroundColor: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ color: 'var(--text-heading)' }}>{item.label}</span>
                    <span className={`badge ${isPass ? 'badge-success' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contradiction & Risk Reasoning Matrix */}
      <div className="console-card">
        <div className="console-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="var(--color-danger)" />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
              CONTRADICTION & VIOLATION MATRIX
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            INSTITUTIONAL RISK REASONING
          </span>
        </div>

        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contradictions.length === 0 ? (
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              borderRadius: '6px',
              color: 'var(--color-success)',
              fontSize: '13px'
            }}>
              ✓ No institutional contradictions or statutory violations detected. Notification adheres to official procedures.
            </div>
          ) : (
            contradictions.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `4px solid ${c.severity === 'CRITICAL' ? 'var(--color-danger)' : c.severity === 'HIGH' ? 'var(--color-warning)' : 'var(--accent-primary)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${c.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                      {c.severity || 'HIGH'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {c.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {c.category}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                  {c.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
