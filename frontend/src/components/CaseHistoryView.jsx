import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { History, Search, RefreshCw, ArrowRight } from 'lucide-react';

export default function CaseHistoryView({ onSelectCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const standardDemoCases = [
    {
      case_id: 'TG-00128',
      created_at: '2026-10-01T08:30:00',
      date: '01 Oct',
      source: 'WhatsApp',
      organization: 'India Post GDS Recruitment Cell',
      risk: 'HIGH',
      status: 'Flagged',
      verdict: 'SCAM',
      trust_score: 12
    },
    {
      case_id: 'TG-00124',
      created_at: '2026-09-30T14:15:00',
      date: '30 Sep',
      source: 'WhatsApp',
      organization: 'PSU Recruitment Board',
      risk: 'HIGH',
      status: 'Investigated',
      verdict: 'SCAM',
      trust_score: 18
    },
    {
      case_id: 'TG-00123',
      created_at: '2026-09-29T11:00:00',
      date: '29 Sep',
      source: 'PDF',
      organization: 'Union Public Service Commission (UPSC)',
      risk: 'LOW',
      status: 'Verified',
      verdict: 'GENUINE',
      trust_score: 96
    },
    {
      case_id: 'TG-00122',
      created_at: '2026-09-28T16:45:00',
      date: '28 Sep',
      source: 'URL',
      organization: 'Postal Recruitment (GDS)',
      risk: 'HIGH',
      status: 'Flagged',
      verdict: 'SCAM',
      trust_score: 14
    },
    {
      case_id: 'TG-00121',
      created_at: '2026-09-27T09:20:00',
      date: '27 Sep',
      source: 'Telegram',
      organization: 'Railway Recruitment Boards (RRB)',
      risk: 'HIGH',
      status: 'Investigated',
      verdict: 'SCAM',
      trust_score: 22
    },
    {
      case_id: 'TG-00120',
      created_at: '2026-09-26T18:10:00',
      date: '26 Sep',
      source: 'Official Portal',
      organization: 'Staff Selection Commission (SSC)',
      risk: 'LOW',
      status: 'Verified',
      verdict: 'GENUINE',
      trust_score: 94
    }
  ];

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => {
            const dateObj = c.created_at ? new Date(c.created_at) : new Date();
            const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            return {
              case_id: c.case_id,
              date: dateStr,
              source: c.input_metadata?.source_platform || 'WhatsApp',
              organization: c.extracted_evidence?.organization || 'Unspecified Entity',
              risk: c.verdict === 'GENUINE' ? 'LOW' : c.verdict === 'SCAM' ? 'HIGH' : 'MEDIUM',
              status: c.verdict === 'GENUINE' ? 'Verified' : c.verdict === 'SCAM' ? 'Flagged' : 'Investigated',
              verdict: c.verdict,
              trust_score: c.trust_score,
              raw_case: c
            };
          });

          const seen = new Set(mapped.map(m => m.case_id));
          const combined = [...mapped, ...standardDemoCases.filter(d => !seen.has(d.case_id))];
          setCases(combined);
        } else {
          setCases(standardDemoCases);
        }
      } else {
        setCases(standardDemoCases);
      }
    } catch (e) {
      setCases(standardDemoCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (c.case_id || '').toLowerCase().includes(q) ||
      (c.organization || '').toLowerCase().includes(q) ||
      (c.source || '').toLowerCase().includes(q);

    const matchesRisk = riskFilter === 'ALL' || c.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

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
              CASE AUDIT REGISTRY
            </h2>
            <span className="badge badge-info">
              EVIDENCE ARCHIVE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Structured records of prior recruitment verification investigations and statutory reports.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCases}
          className="btn-secondary"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Case ID, Organization, or Source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="segmented-control">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setRiskFilter(lvl)}
              className={`segmented-tab ${riskFilter === lvl ? 'active' : ''}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="console-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{
              backgroundColor: 'var(--bg-card-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textAlign: 'left'
            }}>
              <th style={{ padding: '12px 16px' }}>CASE ID</th>
              <th style={{ padding: '12px 16px' }}>DATE</th>
              <th style={{ padding: '12px 16px' }}>SOURCE</th>
              <th style={{ padding: '12px 16px' }}>ORGANIZATION</th>
              <th style={{ padding: '12px 16px' }}>RISK</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((row, idx) => {
              const isHigh = row.risk === 'HIGH';
              const isLow = row.risk === 'LOW';

              return (
                <tr
                  key={row.case_id || idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-card-subtle)',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-active-pill)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'var(--bg-card-subtle)'}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {row.case_id}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {row.date}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-neutral">
                      {row.source}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {row.organization}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${isHigh ? 'badge-danger' : isLow ? 'badge-success' : 'badge-warning'}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-body)' }}>
                    {row.status}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onSelectCase && onSelectCase(row.raw_case || row)}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 11px', fontFamily: 'var(--font-mono)' }}
                    >
                      <span>Load In Console</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
