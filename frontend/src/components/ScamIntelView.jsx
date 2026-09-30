import React, { useEffect, useState } from 'react';
import { Database, ShieldAlert, Phone, CreditCard, Globe, AlertTriangle, Link2, RefreshCw } from 'lucide-react';

export default function ScamIntelView() {
  const [intelData, setIntelData] = useState({ phones: [], upi_ids: [], domains: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('phones');

  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scam-intelligence');
      if (res.ok) {
        const data = await res.json();
        setIntelData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Scam Syndicate Intelligence</h1>
            <span className="badge badge-scam">Cross-Case Infrastructure Registry</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Centralized index of repeated fraudulent phone numbers, UPI recipient addresses, and typosquatted domains reused across fake circulars.
          </p>
        </div>

        <button 
          onClick={fetchIntel}
          className="btn-secondary"
          style={{ fontSize: '13px' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Intelligence Feed</span>
        </button>
      </div>

      {/* Intelligence Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>FLAGGED PHONES / WHATSAPP</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                {intelData.phones?.length || 0}
              </div>
            </div>
            <Phone size={32} color="#ef4444" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Used for WhatsApp screenshot extortion
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>FRAUDULENT UPI HANDLES</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                {intelData.upi_ids?.length || 0}
              </div>
            </div>
            <CreditCard size={32} color="#f59e0b" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Illegal fee collection accounts
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>TYPOSQUATTED DOMAINS</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                {intelData.domains?.length || 0}
              </div>
            </div>
            <Globe size={32} color="#a855f7" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Phishing sites mimicking .gov.in
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('phones')}
          className={activeTab === 'phones' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '13px' }}
        >
          Flagged Phone Numbers ({intelData.phones?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('upi')}
          className={activeTab === 'upi' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '13px' }}
        >
          Fraudulent UPI Accounts ({intelData.upi_ids?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('domains')}
          className={activeTab === 'domains' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '13px' }}
        >
          Spoofed Domains ({intelData.domains?.length || 0})
        </button>
      </div>

      {/* Registry Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {activeTab === 'phones' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Phone / WhatsApp</th>
                <th style={{ padding: '10px 8px' }}>Associated Case</th>
                <th style={{ padding: '10px 8px' }}>Claimed Organization</th>
                <th style={{ padding: '10px 8px' }}>Flag Reason</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {intelData.phones?.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                    {p.value}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#38bdf8' }}>{p.case_id}</td>
                  <td style={{ padding: '12px 8px', color: '#f8fafc' }}>{p.organization_claimed}</td>
                  <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{p.reason}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="badge badge-scam">{p.status || 'CONFIRMED_SCAM'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'upi' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>UPI Address</th>
                <th style={{ padding: '10px 8px' }}>Connected Case</th>
                <th style={{ padding: '10px 8px' }}>Claimed Org</th>
                <th style={{ padding: '10px 8px' }}>Flag Reason</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {intelData.upi_ids?.map((u, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                    {u.value}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#38bdf8' }}>{u.case_id}</td>
                  <td style={{ padding: '12px 8px', color: '#f8fafc' }}>{u.organization_claimed}</td>
                  <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{u.reason}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="badge badge-scam">{u.status || 'CONFIRMED_SCAM'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'domains' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Domain Name</th>
                <th style={{ padding: '10px 8px' }}>First Reported In</th>
                <th style={{ padding: '10px 8px' }}>Deceptive Pattern Reason</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {intelData.domains?.map((d, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
                    {d.value}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#38bdf8' }}>{d.case_id}</td>
                  <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{d.reason}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="badge badge-scam">{d.status || 'CONFIRMED_SCAM'}</span>
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
