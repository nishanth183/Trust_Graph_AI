import React, { useEffect, useState } from 'react';
import {
  Phone,
  CreditCard,
  Globe,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Search,
  Copy,
  Check,
  PlusCircle,
  Download,
  FileText,
  ArrowRight,
  X,
  Filter,
  BarChart3,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ScamIntelView() {
  const [intelData, setIntelData] = useState({ phones: [], upi_ids: [], domains: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'phones' | 'upis' | 'domains'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Quick Instant Lookup State
  const [lookupInput, setLookupInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  // Threat Dossier Modal
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: 'phone',
    value: '',
    organization_claimed: '',
    reason: ''
  });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Copy feedback
  const [copiedValue, setCopiedValue] = useState(null);

  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scam-intelligence');
      if (res.ok) {
        const data = await res.json();
        setIntelData(data);
      }
    } catch (e) {
      console.error('Failed to load scam intelligence:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  // Instant Threat Lookup
  const handleQuickLookup = async (queryToUse) => {
    const q = (queryToUse || lookupInput).trim();
    if (!q) return;

    setLookupLoading(true);
    setLookupResult(null);

    try {
      const res = await fetch('/api/scam-intelligence/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      } else {
        setLookupResult({ match_found: false, query: q, results: [] });
      }
    } catch (e) {
      setLookupResult({ match_found: false, query: q, results: [], error: 'Lookup failed' });
    } finally {
      setLookupLoading(false);
    }
  };

  // Report Indicator Submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.value.trim()) return;

    setReportSubmitting(true);
    try {
      const res = await fetch('/api/scam-intelligence/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setReportModalOpen(false);
          setReportForm({ type: 'phone', value: '', organization_claimed: '', reason: '' });
          fetchIntel();
        }, 1200);
      }
    } catch (e) {
      console.error('Error reporting indicator:', e);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Export intelligence as JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(intelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGraph_Threat_Intelligence_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compile full normalized list
  const allIndicators = [
    ...(intelData.phones || []).map(p => ({ ...p, category: 'phones', categoryLabel: 'Phone Number' })),
    ...(intelData.upi_ids || []).map(u => ({ ...u, category: 'upis', categoryLabel: 'UPI Handle' })),
    ...(intelData.domains || []).map(d => ({ ...d, category: 'domains', categoryLabel: 'Spoofed Domain' }))
  ];

  // Distinct agencies
  const distinctAgencies = Array.from(
    new Set(allIndicators.map(i => i.organization_claimed).filter(Boolean))
  );

  // Filtered indicators
  const filteredList = allIndicators.filter(item => {
    // Category filter
    if (activeTab !== 'all' && item.category !== activeTab) return false;

    // Status filter
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

    // Agency filter
    if (selectedAgency !== 'ALL' && item.organization_claimed !== selectedAgency) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const valMatch = (item.value || '').toLowerCase().includes(q);
      const orgMatch = (item.organization_claimed || '').toLowerCase().includes(q);
      const reasonMatch = (item.reason || '').toLowerCase().includes(q);
      const caseMatch = Array.isArray(item.cases)
        ? item.cases.some(c => c.toLowerCase().includes(q))
        : (item.case_id || '').toLowerCase().includes(q);
      return valMatch || orgMatch || reasonMatch || caseMatch;
    }

    return true;
  });

  const stats = intelData.stats || {
    total_indicators: allIndicators.length,
    reused_phones_count: intelData.phones?.length || 0,
    fraudulent_upis_count: intelData.upi_ids?.length || 0,
    spoofed_domains_count: intelData.domains?.length || 0,
    total_scam_cases_linked: 32
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. Header with Title & Quick Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Scam Syndicate Intelligence
            </h1>
            <span className="tg-pill tg-pill-warning" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
              LIVE THREAT REGISTRY
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px', maxWidth: '720px', lineHeight: 1.5 }}>
            Centralized database of fraudulent phone numbers, UPI recipient addresses, and typosquatted domains actively reused across fake government appointment circulars.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchIntel}
            className="tg-btn-secondary"
            style={{ padding: '9px 14px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Feed</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="tg-btn-secondary"
            style={{ padding: '9px 14px', fontSize: '13px' }}
            title="Download full intelligence feed as JSON"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="tg-btn-primary"
            style={{ padding: '9px 16px', fontSize: '13px' }}
          >
            <PlusCircle size={15} />
            <span>Report Indicator</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Instant Threat Verifier Widget */}
      <div className="tg-card" style={{
        padding: '24px',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '5px solid var(--color-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Instant Threat Lookup
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Quickly verify any suspicious WhatsApp number, UPI ID, or application website link directly against active syndicate records.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickLookup();
          }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="e.g. +919876543210, recruitment.officer@okaxis, or rrb-recruitment-gov.online"
              className="tg-input"
              style={{ paddingLeft: '40px', height: '46px', fontSize: '14px' }}
            />
          </div>
          <button
            type="submit"
            className="tg-btn-primary"
            disabled={lookupLoading || !lookupInput.trim()}
            style={{ height: '46px', padding: '0 24px', fontSize: '14px' }}
          >
            {lookupLoading ? 'Checking...' : 'Check Database'}
          </button>
        </form>

        {/* Quick test chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Try sample indicators:</span>
          {[
            { label: 'recruitment.officer@okaxis', query: 'recruitment.officer@okaxis' },
            { label: '+919876543210', query: '+919876543210' },
            { label: 'rrb-recruitment-gov.online', query: 'rrb-recruitment-gov.online' },
            { label: 'delhipolice@okaxis', query: 'delhipolice@okaxis' }
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setLookupInput(sample.query);
                handleQuickLookup(sample.query);
              }}
              style={{
                fontSize: '11px',
                padding: '3px 9px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Lookup Results Display */}
        {lookupResult && (
          <div style={{ marginTop: '16px' }}>
            {lookupResult.match_found ? (
              <div style={{
                padding: '16px 20px',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1.5px solid var(--color-danger-border)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger)' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>
                    THREAT DETECTED: {lookupResult.total_matches} Matching Syndicate Indicator{lookupResult.total_matches > 1 ? 's' : ''} Found
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {lookupResult.results.map((res, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <strong>{res.value}</strong> · <span style={{ color: 'var(--text-muted)' }}>Impersonated: {res.organization_claimed}</span>
                        <div style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '2px' }}>
                          Reason: {res.reason}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="tg-pill tg-pill-warning" style={{ fontSize: '11px' }}>
                          {res.status || 'CONFIRMED SCAM'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedIndicator(res)}
                          className="tg-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          View Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '14px 18px',
                backgroundColor: 'var(--color-info-bg)',
                border: '1px solid var(--color-info-border)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--color-info-text)'
              }}>
                <ShieldCheck size={18} color="var(--color-info-text)" />
                <span>
                  No prior syndicate compromise record found for <strong>"{lookupResult.query}"</strong>. To fully verify a recruitment notice containing this information, use the <strong>Check a Job</strong> module for complete circular and stamp verification.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. National Cybercrime Reporting Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        backgroundColor: 'var(--color-primary-light)',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        borderRadius: '12px',
        fontSize: '13px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="var(--color-primary)" />
          <span style={{ color: 'var(--text-primary)' }}>
            National Cybercrime Reporting Portal: <strong style={{ color: 'var(--color-primary)' }}>cybercrime.gov.in</strong>
          </span>
        </div>
        <div style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>CITIZEN EMERGENCY HELPLINE: 1930</span>
        </div>
      </div>

      {/* 4. Interactive Syndicate Stat Cards (Clickable to switch tab) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px'
      }}>
        {/* Reused Phones */}
        <div
          onClick={() => setActiveTab('phones')}
          className="tg-card tg-row-hover"
          style={{
            padding: '22px',
            cursor: 'pointer',
            border: activeTab === 'phones' ? '2px solid var(--color-danger)' : undefined,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-danger)', letterSpacing: '0.04em' }}>
              REUSED PHONES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={16} color="var(--color-danger)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {intelData.phones?.length || 0}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>Cataloged</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            WhatsApp & Telegram syndicates operating across state PSC and Postal schemes.
          </div>
        </div>

        {/* Fraudulent UPIs */}
        <div
          onClick={() => setActiveTab('upis')}
          className="tg-card tg-row-hover"
          style={{
            padding: '22px',
            cursor: 'pointer',
            border: activeTab === 'upis' ? '2px solid var(--color-danger)' : undefined,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-danger)', letterSpacing: '0.04em' }}>
              FRAUDULENT UPIS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="var(--color-danger)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {intelData.upi_ids?.length || 0}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>Identified</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Personal mule VPA accounts collecting unauthorized application fees.
          </div>
        </div>

        {/* Spoofed Domains */}
        <div
          onClick={() => setActiveTab('domains')}
          className="tg-card tg-row-hover"
          style={{
            padding: '22px',
            cursor: 'pointer',
            border: activeTab === 'domains' ? '2px solid var(--color-danger)' : undefined,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-danger)', letterSpacing: '0.04em' }}>
              SPOOFED DOMAINS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="var(--color-danger)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {intelData.domains?.length || 0}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>Blacklisted</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Typosquatted .online, .xyz portals impersonating official government departments.
          </div>
        </div>

        {/* Intercepted Cases */}
        <div
          onClick={() => setActiveTab('all')}
          className="tg-card tg-row-hover"
          style={{
            padding: '22px',
            cursor: 'pointer',
            border: activeTab === 'all' ? '2px solid var(--color-primary)' : undefined,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
              LINKED CASES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="var(--color-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.total_scam_cases_linked || 32}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>Intercepted</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Circulating fraudulent recruitment notices neutralized across regions.
          </div>
        </div>
      </div>

      {/* 5. Main Filter & Intelligence Table Card */}
      <div className="tg-card" style={{ padding: '24px' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Indicators (${allIndicators.length})` },
              { id: 'phones', label: `Phone Numbers (${intelData.phones?.length || 0})` },
              { id: 'upis', label: `UPI Handles (${intelData.upi_ids?.length || 0})` },
              { id: 'domains', label: `Spoofed Domains (${intelData.domains?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'tg-btn-primary' : 'tg-btn-ghost'}
                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {filteredList.length} of {allIndicators.length} verified threats
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone, UPI, domain, agency, reason..."
              className="tg-input"
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
            />
          </div>

          {/* Agency Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="tg-input"
              style={{ height: '40px', fontSize: '13px', padding: '0 12px' }}
            >
              <option value="ALL">All Impersonated Agencies</option>
              {distinctAgencies.map((agency, i) => (
                <option key={i} value={agency}>{agency}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tg-input"
              style={{ height: '40px', fontSize: '13px', padding: '0 12px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED_SCAM">Confirmed Scam</option>
              <option value="FLAGGED">Flagged</option>
              <option value="COMMUNITY_FLAGGED">Community Flagged</option>
            </select>
          </div>
        </div>

        {/* Indicators List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Loading threat intelligence database...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>No threat indicators matched your filter criteria</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Try clearing the search query or resetting filters</p>
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const isPhone = item.category === 'phones';
              const isUPI = item.category === 'upis';
              const isDomain = item.category === 'domains';

              return (
                <div
                  key={idx}
                  className="tg-card tg-row-hover"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Left: Icon & Value */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-danger-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPhone && <Phone size={17} color="var(--color-danger)" />}
                      {isUPI && <CreditCard size={17} color="var(--color-danger)" />}
                      {isDomain && <Globe size={17} color="var(--color-danger)" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.value}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.value)}
                          title="Copy indicator"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedValue === item.value ? 'var(--color-success)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px 4px'
                          }}
                        >
                          {copiedValue === item.value ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Target: <strong>{item.organization_claimed || 'Unspecified'}</strong></span>
                        <span>·</span>
                        <span>{item.categoryLabel}</span>
                        {item.report_date && (
                          <>
                            <span>·</span>
                            <span>Reported: {item.report_date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Reason / Modus Operandi Preview */}
                  <div style={{ flex: 1, minWidth: '200px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.reason}
                  </div>

                  {/* Right: Badges & Dossier Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {item.case_count > 1 ? (
                      <span className="tg-pill tg-pill-warning" style={{ fontSize: '11px', fontWeight: 700 }}>
                        Reused in {item.case_count} cases
                      </span>
                    ) : (
                      <span className="tg-pill tg-pill-caution" style={{ fontSize: '11px' }}>
                        {item.status || 'FLAGGED'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedIndicator(item)}
                      className="tg-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <span>Threat Dossier</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Threat Dossier Modal (When clicking an indicator) */}
      {selectedIndicator && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="tg-card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setSelectedIndicator(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={22} color="var(--color-danger)" />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  THREAT INTEL DOSSIER
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedIndicator.value}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Targeted Organization Impersonation
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                  {selectedIndicator.organization_claimed || 'Unspecified Government Department'}
                </div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Modus Operandi & Contradiction Notes
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.5 }}>
                  {selectedIndicator.reason}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Infrastructure Status
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-danger)', marginTop: '3px' }}>
                    {selectedIndicator.status || 'CONFIRMED_SCAM'}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    First Reported Date
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {selectedIndicator.report_date || '2026-02-14'}
                  </div>
                </div>
              </div>

              {/* Connected Cases */}
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Associated Intercepted Cases ({selectedIndicator.cases?.length || 1})
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedIndicator.cases || [selectedIndicator.case_id || 'TG-2026-DEMO-003']).map((cid, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                      }}
                    >
                      {cid}
                    </span>
                  ))}
                </div>
              </div>

              {/* Advisory note */}
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--color-warning-text)',
                lineHeight: 1.4
              }}>
                <strong>Advisory:</strong> Never transfer application fees to personal UPI addresses or call unverified helpline numbers. Official Central & State recruitments only accept fees through authorized Treasury or Bharatkosh payment gateways.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => handleCopy(selectedIndicator.value)}
                className="tg-btn-secondary"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                {copiedValue === selectedIndicator.value ? 'Copied!' : 'Copy Value'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndicator(null)}
                className="tg-btn-primary"
                style={{ padding: '10px 22px', fontSize: '13px' }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Community Reporting Modal */}
      {reportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="tg-card" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Report Scam Infrastructure
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Submit a suspicious recruitment phone number, UPI handle, or phishing link to the syndicate threat registry.
              </p>
            </div>

            {reportSuccess ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                borderRadius: '12px',
                color: 'var(--color-success)'
              }}>
                <Check size={36} style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Threat Indicator Submitted!</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Added to the global syndicate verification database.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Type Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Infrastructure Category *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'phone', label: 'Phone', icon: Phone },
                      { id: 'upi', label: 'UPI Handle', icon: CreditCard },
                      { id: 'domain', label: 'Website', icon: Globe }
                    ].map((t) => {
                      const Icon = t.icon;
                      const active = reportForm.type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setReportForm({ ...reportForm, type: t.id })}
                          className={active ? 'tg-btn-primary' : 'tg-btn-secondary'}
                          style={{ padding: '9px 10px', fontSize: '12px', justifyContent: 'center' }}
                        >
                          <Icon size={14} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Indicator Value */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Indicator Value (Phone, UPI, or URL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.value}
                    onChange={(e) => setReportForm({ ...reportForm, value: e.target.value })}
                    placeholder={
                      reportForm.type === 'phone'
                        ? '+91 98765 43210'
                        : reportForm.type === 'upi'
                        ? 'officer@okaxis or exam.cell@paytm'
                        : 'rrb-recruitment-gov.online'
                    }
                    className="tg-input"
                    style={{ height: '42px', fontSize: '13px' }}
                  />
                </div>

                {/* Organization Claimed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Impersonated Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportForm.organization_claimed}
                    onChange={(e) => setReportForm({ ...reportForm, organization_claimed: e.target.value })}
                    placeholder="e.g. Railway Recruitment Board, India Post, UPSC"
                    className="tg-input"
                    style={{ height: '42px', fontSize: '13px' }}
                  />
                </div>

                {/* Reason / Modus Operandi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Observations / Scam Description
                  </label>
                  <textarea
                    rows={3}
                    value={reportForm.reason}
                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                    placeholder="e.g. Sent fake joining letter on WhatsApp requesting ₹850 document verification fee"
                    className="tg-input"
                    style={{ padding: '10px 12px', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="tg-btn-ghost"
                    style={{ padding: '10px 18px', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="tg-btn-primary"
                    disabled={reportSubmitting || !reportForm.value.trim()}
                    style={{ padding: '10px 22px', fontSize: '13px' }}
                  >
                    {reportSubmitting ? 'Recording...' : 'Submit Threat Indicator'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
