import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Dna, 
  Network, 
  FileDown, 
  Flag, 
  CheckCircle2, 
  AlertOctagon,
  Building,
  Hash,
  Globe,
  Mail,
  Phone,
  CreditCard,
  QrCode,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ResultView({ result, onViewGraph, onViewDNA, onReportCase }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!result) return null;

  const {
    case_id,
    verdict,
    trust_score,
    risk_level,
    scam_probability,
    confidence,
    top_reasons = [],
    recommended_action,
    evidence_summary = {},
    extracted_evidence = {},
    recruitment_dna = {},
    contradiction_findings = [],
    scam_network_findings = [],
    explainability = {}
  } = result;

  // Colors based on verdict
  const verdictConfig = {
    GENUINE: {
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: ShieldCheck,
      title: 'GENUINE RECRUITMENT',
      subtitle: 'Conforms to official Indian Government gazette standards.'
    },
    SUSPICIOUS: {
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: AlertTriangle,
      title: 'SUSPICIOUS NOTIFICATION',
      subtitle: 'Irregularities detected. Manual verification recommended.'
    },
    SCAM: {
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: XCircle,
      title: 'CONFIRMED FRAUD / SCAM',
      subtitle: 'Severe institutional conflicts and illegal payment requests detected.'
    },
    INCONCLUSIVE: {
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      border: 'rgba(148, 163, 184, 0.3)',
      icon: HelpCircle,
      title: 'INCONCLUSIVE EVIDENCE',
      subtitle: 'Insufficient verifiable credentials provided in notification.'
    }
  };

  const currentVerdict = verdictConfig[verdict] || verdictConfig.INCONCLUSIVE;
  const VerdictIcon = currentVerdict.icon;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Case Identifier:</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '15px',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            {case_id}
          </span>
          <span className="badge badge-demo" style={{ fontSize: '11px' }}>
            DEMO MODE EVALUATED
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onViewDNA()}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <Dna size={16} color="#a855f7" />
            <span>Recruitment DNA</span>
          </button>
          <button
            onClick={() => onViewGraph()}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <Network size={16} color="#38bdf8" />
            <span>Evidence Graph</span>
          </button>
          <a
            href={`/api/report/${case_id}/download`}
            download={`TrustGraph_Report_${case_id}.pdf`}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px', textDecoration: 'none' }}
          >
            <FileDown size={16} />
            <span>Report PDF</span>
          </a>
          <button
            onClick={() => onReportCase(case_id)}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
          >
            <Flag size={16} />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Primary Verdict Hero Banner */}
      <div className="glass-card" style={{
        padding: '36px',
        marginBottom: '28px',
        background: `linear-gradient(135deg, ${currentVerdict.bg} 0%, rgba(15, 23, 42, 0.9) 100%)`,
        border: `1px solid ${currentVerdict.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Left: Verdict info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: currentVerdict.bg,
              border: `2px solid ${currentVerdict.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 24px ${currentVerdict.color}40`
            }}>
              <VerdictIcon size={38} color={currentVerdict.color} />
            </div>

            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: currentVerdict.color,
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                TrustGraph AI Final Classification
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                {currentVerdict.title}
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>
                {currentVerdict.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Key Quantitative Metrics */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {/* Trust Score Dial */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                border: `4px solid ${verdict === 'INCONCLUSIVE' ? '#4b5563' : currentVerdict.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 13, 22, 0.6)',
                boxShadow: verdict === 'INCONCLUSIVE' ? 'none' : `0 0 16px ${currentVerdict.color}30`
              }}>
                {verdict === 'INCONCLUSIVE' ? (
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#6b7280', lineHeight: 1 }}>—</span>
                ) : (
                  <>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: currentVerdict.color, lineHeight: 1 }}>
                      {Math.round(trust_score)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginTop: '6px' }}>
                {verdict === 'INCONCLUSIVE' ? "Can't score" : 'Trust Score'}
              </div>
            </div>

            {/* Risk & Probability Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ color: '#94a3b8' }}>Risk Level: </span>
                <strong style={{ color: risk_level === 'HIGH' ? '#f87171' : (risk_level === 'LOW' ? '#34d399' : '#fbbf24') }}>
                  {risk_level}
                </strong>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ color: '#94a3b8' }}>Scam Probability: </span>
                <strong style={{ color: scam_probability > 60 ? '#f87171' : '#34d399' }}>
                  {scam_probability}%
                </strong>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ color: '#94a3b8' }}>DNA Alignment: </span>
                <strong style={{ color: recruitment_dna?.similarity_score > 70 ? '#34d399' : '#f87171' }}>
                  {recruitment_dna?.similarity_score || 0}%
                </strong>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Advisory Action Callout */}
      <div style={{
        background: verdict === 'SCAM' ? 'rgba(239, 68, 68, 0.12)' : (verdict === 'GENUINE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
        borderLeft: `4px solid ${currentVerdict.color}`,
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <AlertOctagon size={22} color={currentVerdict.color} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: currentVerdict.color, textTransform: 'uppercase' }}>
            Recommended Citizen Action
          </div>
          <div style={{ fontSize: '14px', color: '#f8fafc', marginTop: '2px', lineHeight: 1.5 }}>
            {recommended_action}
          </div>
        </div>
      </div>

      {/* Grid: Top Reasons & Extracted Evidence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        
        {/* Card 1: Top Reasons for Decision */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Top Determinative Evidence Factors</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {top_reasons.map((reason, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: verdict === 'SCAM' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: verdict === 'SCAM' ? '#f87171' : '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {reason}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>{evidence_summary.verified_count || 0}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Verified</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24' }}>{evidence_summary.suspicious_count || 0}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Suspicious</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f87171' }}>{evidence_summary.conflicting_count || 0}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Conflicts</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8' }}>{evidence_summary.missing_count || 0}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Missing</div>
            </div>
          </div>
        </div>

        {/* Card 2: Extracted Credentials */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Extracted Recruitment Credentials
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8', width: '38%' }}>Claimed Organization</td>
                <td style={{ padding: '8px 0', fontWeight: 600, color: '#f8fafc' }}>
                  {extracted_evidence.organization || <span style={{ color: '#64748b' }}>Unspecified</span>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Notification Number</td>
                <td style={{ padding: '8px 0', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {extracted_evidence.notification_number || <span style={{ color: '#64748b' }}>None Provided</span>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Domain / Portal</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>
                  {extracted_evidence.domain ? (
                    <span style={{ color: extracted_evidence.domain.endsWith('.gov.in') ? '#34d399' : '#f87171' }}>
                      {extracted_evidence.domain}
                    </span>
                  ) : <span style={{ color: '#64748b' }}>None Provided</span>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Contact Email</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>
                  {extracted_evidence.email || <span style={{ color: '#64748b' }}>None Provided</span>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Contact Phone / WhatsApp</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>
                  {extracted_evidence.phone || <span style={{ color: '#64748b' }}>None Provided</span>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Fee / Payment Channel</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>
                  {extracted_evidence.upi_id ? (
                    <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      Personal UPI: {extracted_evidence.upi_id}
                    </span>
                  ) : (
                    extracted_evidence.application_fee ? `₹${extracted_evidence.application_fee}` : 'Standard / Not Specified'
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#94a3b8' }}>Payment QR Code</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>
                  {extracted_evidence.qr_detected ? (
                    <span style={{ color: '#f87171' }}>Detected in Document</span>
                  ) : (
                    <span style={{ color: '#34d399' }}>None Detected</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Contradictions & Reused Scam Syndicate Linkages */}
      {contradiction_findings.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>Identified Evidence Contradictions ({contradiction_findings.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contradiction_findings.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{item.factor}</strong>
                  <span className="badge badge-scam" style={{ fontSize: '10px' }}>{item.severity}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '6px' }}>
                  <strong>Evidence:</strong> {item.evidence}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Explainability Drawer */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}>
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <span>View Technical Details & Explainable AI (SHAP-Style Feature Attribution)</span>
          {showTechnicalDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showTechnicalDetails && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
              Model Architecture: <strong>{explainability.model_type}</strong>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {/* Supporting Factors */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
                  Positive Supporting Evidence (Increases Trust)
                </h4>
                {explainability.supporting_evidence?.length > 0 ? (
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {explainability.supporting_evidence.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>No verified supporting official credentials found.</span>
                )}
              </div>

              {/* Risk Factors */}
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '10px' }}>
                  Negative Risk Evidence (Increases Scam Probability)
                </h4>
                {explainability.risk_evidence?.length > 0 ? (
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {explainability.risk_evidence.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>No adverse scam indicators identified.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
