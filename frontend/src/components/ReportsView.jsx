import React, { useState } from 'react';
import { FileText, FileDown, ExternalLink, ShieldCheck, Flag } from 'lucide-react';

export default function ReportsView({ activeCaseId = 'TG-2026-00128', onOpenFeedback }) {
  const [targetCaseId, setTargetCaseId] = useState(activeCaseId);

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
              FORENSIC AUDIT CERTIFICATION
            </h2>
            <span className="badge badge-info">
              VERIFIABLE EXPORTS
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Generate cryptographic audit certificates and evidentiary forensic reports for citizens, applicants, and cyber law enforcement.
          </p>
        </div>
      </div>

      {/* Case Generator Card */}
      <div className="console-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '12px' }}>
          Select Case Identifier to Generate Evidentiary Certificate:
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={targetCaseId}
            onChange={(e) => setTargetCaseId(e.target.value)}
            placeholder="e.g. TG-2026-00128"
            className="form-input"
            style={{ maxWidth: '320px', fontFamily: 'var(--font-mono)' }}
          />

          <a
            href={`/api/report/${targetCaseId}/view`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
          >
            <ExternalLink size={14} />
            <span>View Online Certificate</span>
          </a>

          <a
            href={`/api/report/${targetCaseId}/download`}
            download
            className="btn-secondary"
            style={{ textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
          >
            <FileDown size={14} />
            <span>Download Official PDF Report</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenFeedback && onOpenFeedback(targetCaseId)}
            className="btn-secondary"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Flag size={14} />
            <span>Submit Verification Feedback</span>
          </button>
        </div>
      </div>

      {/* Legal & Standards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        <div className="console-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '10px' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>EVIDENTIARY ADMISSIBILITY</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Reports conform to Indian Evidence Act & IT Act 2000 digital certificate requirements. All extracted OCR text, entity vectors, SHA-256 hashes, and official registry comparison results are cryptographic timestamps.
          </p>
        </div>

        <div className="console-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '10px' }}>
            <FileText size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AUDIT CONTENTS</span>
          </div>
          <ul style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
            <li>Case Meta & Cryptographic Fingerprint</li>
            <li>9-Dimensional Recruitment DNA Genome</li>
            <li>Attributed Cytoscape Evidence Graph Schema</li>
            <li>Gazette Benchmark Compliance Checklist</li>
            <li>Recommended Legal Directives (MHA Portal 1930)</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
