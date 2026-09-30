import React, { useEffect, useState } from 'react';
import { History, Search, FileDown, ArrowRight, RefreshCw, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

export default function CaseHistoryView({ onSelectCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      (c.case_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.extracted_evidence?.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.extracted_evidence?.domain || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = verdictFilter === 'ALL' || c.verdict === verdictFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Audit & Case History</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Archived recruitment verifications and cyber forensic reports.
          </p>
        </div>

        <button onClick={fetchCases} className="btn-secondary" style={{ fontSize: '13px' }}>
          <RefreshCw size={16} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Case ID, Organization, or Domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              fontSize: '13px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'GENUINE', 'SUSPICIOUS', 'SCAM'].map((v) => (
            <button
              key={v}
              onClick={() => setVerdictFilter(v)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: verdictFilter === v ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: verdictFilter === v ? '#38bdf8' : '#94a3b8',
                border: verdictFilter === v ? '1px solid #38bdf8' : '1px solid var(--border-color)'
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Case Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {filteredCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            No cases match the selected filter. Run a verification from the Verify page or load a demo case!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Case ID</th>
                <th style={{ padding: '10px 8px' }}>Timestamp</th>
                <th style={{ padding: '10px 8px' }}>Claimed Department</th>
                <th style={{ padding: '10px 8px' }}>Verdict</th>
                <th style={{ padding: '10px 8px' }}>Trust Score</th>
                <th style={{ padding: '10px 8px' }}>Input Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.case_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    {c.case_id}
                  </td>
                  <td style={{ padding: '14px 8px', color: '#94a3b8' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: 600, color: '#f8fafc' }}>
                    {c.extracted_evidence?.organization || 'Unspecified'}
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <span className={`badge ${c.verdict === 'GENUINE' ? 'badge-genuine' : (c.verdict === 'SCAM' ? 'badge-scam' : 'badge-suspicious')}`}>
                      {c.verdict}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: 700, color: c.trust_score > 70 ? '#34d399' : '#f87171' }}>
                    {Math.round(c.trust_score)} / 100
                  </td>
                  <td style={{ padding: '14px 8px', color: '#94a3b8', fontSize: '11px' }}>
                    {c.input_metadata?.input_type || 'TEXT'}
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectCase(c)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <span>View</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
