import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  FileText, 
  Globe, 
  Camera, 
  ChevronRight, 
  Filter, 
  FolderOpen,
  Trash2,
  FileDown
} from 'lucide-react';

export default function CasesView({ onSelectCase, onStartNewCheck, authToken }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/history', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => {
            const dateObj = c.created_at ? new Date(c.created_at) : new Date();
            const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            
            let status = 'Looks Good';
            let statusType = 'verified';
            if (c.verdict === 'SCAM' || c.trust_score < 40) {
              status = 'High Risk';
              statusType = 'warning';
            } else if (c.verdict === 'SUSPICIOUS' || c.verdict === 'CAUTION' || c.trust_score < 75) {
              status = 'Needs Caution';
              statusType = 'caution';
            }

            return {
              case_id: c.case_id,
              source: c.input_type || c.input_metadata?.source_platform || 'Message',
              organization: c.organization || c.extracted_evidence?.organization || 'Government Department',
              status,
              statusType,
              time: dateStr,
              trust_score: c.trust_score || 50,
              verdict: c.verdict,
              warning_count: c.contradiction_findings?.length || 0,
              raw_case: c
            };
          });
          setCases(mapped);
        } else {
          setCases([]);
        }
      } else {
        setCases([]);
      }
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCase = async (caseId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete case ${caseId}? This action cannot be undone.`)) {
      return;
    }
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/case/${caseId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.case_id !== caseId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || `Failed to delete case ${caseId}`);
      }
    } catch (err) {
      alert(`Error deleting case: ${err.message}`);
    }
  };

  const handleDownloadPdf = async (caseId, e) => {
    e.stopPropagation();
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/report/${caseId}/download`, { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Failed to download report.");
        return;
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `TrustGraph_Report_${caseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(`Error downloading report: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [authToken]);

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'whatsapp':
      case 'message':
      case 'telegram':
      case 'sms':
        return <MessageSquare size={16} color="var(--color-primary)" />;
      case 'pdf':
        return <FileText size={16} color="#DC2626" />;
      case 'photo':
      case 'screenshot':
        return <Camera size={16} color="#059669" />;
      case 'website':
      case 'url':
        return <Globe size={16} color="#6366F1" />;
      default:
        return <MessageSquare size={16} color="var(--text-muted)" />;
    }
  };

  const getStatusBadge = (statusType, text) => {
    if (statusType === 'verified') {
      return (
        <span className="tg-pill tg-pill-verified" style={{ fontSize: '12px' }}>
          <CheckCircle2 size={13} />
          <span>{text}</span>
        </span>
      );
    }
    if (statusType === 'warning') {
      return (
        <span className="tg-pill tg-pill-warning" style={{ fontSize: '12px' }}>
          <AlertCircle size={13} />
          <span>{text}</span>
        </span>
      );
    }
    return (
      <span className="tg-pill tg-pill-caution" style={{ fontSize: '12px' }}>
        <AlertTriangle size={13} />
        <span>{text}</span>
      </span>
    );
  };

  const filteredCases = cases.filter(item => {
    const matchesSearch = 
      item.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'VERIFIED') return item.statusType === 'verified';
    if (statusFilter === 'CAUTION') return item.statusType === 'caution';
    if (statusFilter === 'RISK') return item.statusType === 'warning';
    return true;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header (Matching Screen 8 "My Checks") */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Checks
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            View your previous check results and evidence files.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchCases}
            className="tg-btn-ghost"
            title="Refresh checks list"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onStartNewCheck}
            className="tg-btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            <span>+ Check a New Job</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="tg-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, organization, or source..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={statusFilter === 'ALL' ? 'tg-btn-primary' : 'tg-btn-ghost'}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
          >
            All ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter('VERIFIED')}
            className={statusFilter === 'VERIFIED' ? 'tg-btn-primary' : 'tg-btn-ghost'}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
          >
            Matches
          </button>
          <button
            onClick={() => setStatusFilter('CAUTION')}
            className={statusFilter === 'CAUTION' ? 'tg-btn-primary' : 'tg-btn-ghost'}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
          >
            Caution
          </button>
          <button
            onClick={() => setStatusFilter('RISK')}
            className={statusFilter === 'RISK' ? 'tg-btn-primary' : 'tg-btn-ghost'}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
          >
            High Risk
          </button>
        </div>

      </div>

      {/* Checks List */}
      <div className="tg-card" style={{ padding: '8px 12px' }}>
        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '15px', fontWeight: 600 }}>Loading your checks...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderOpen size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 600 }}>
              {cases.length === 0 ? 'No checks yet. Start by checking a job message!' : 'No checks matched your search.'}
            </p>
            {cases.length === 0 ? (
              <button
                onClick={onStartNewCheck}
                className="tg-btn-primary"
                style={{ marginTop: '16px' }}
              >
                <span>Check a Job Message</span>
              </button>
            ) : (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                className="tg-btn-secondary"
                style={{ marginTop: '12px' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredCases.map((item, idx) => (
              <div
                key={item.case_id + idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 16px',
                  borderBottom: idx === filteredCases.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s ease',
                  borderRadius: '10px'
                }}
                className="tg-row-hover"
              >
                {/* Left: Source Icon & Case Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '180px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getSourceIcon(item.source)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.case_id}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.source}
                    </div>
                  </div>
                </div>

                {/* Middle: Organization Name */}
                <div style={{ flex: 1, padding: '0 16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.organization}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.verdict === 'INCONCLUSIVE'
                      ? <span style={{ fontStyle: 'italic' }}>Score: —</span>
                      : `Score: ${item.trust_score}/100`
                    }
                  </div>
                </div>

                {/* Status Pill */}
                <div style={{ minWidth: '150px', display: 'flex', justifyContent: 'center' }}>
                  {getStatusBadge(item.statusType, item.status)}
                </div>

                {/* Timestamp */}
                <div style={{ minWidth: '100px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {item.time}
                </div>

                {/* Action Buttons: View, Download PDF, Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginLeft: '12px' }}>
                  <button
                    onClick={() => onSelectCase(item.raw_case)}
                    className="tg-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    title="View case analysis"
                  >
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => handleDownloadPdf(item.case_id, e)}
                    className="tg-btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    title="Download official PDF report"
                  >
                    <FileDown size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCase(item.case_id, e)}
                    className="tg-btn-ghost"
                    style={{ padding: '6px 8px', fontSize: '12px', color: '#DC2626' }}
                    title="Delete this case"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
