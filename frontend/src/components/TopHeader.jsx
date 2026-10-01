import React from 'react';
import { Menu, Sun, Moon, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';

export default function TopHeader({ 
  activeTab, 
  currentCaseId, 
  theme, 
  onToggleTheme, 
  onToggleMobileMenu 
}) {
  const [copied, setCopied] = React.useState(false);

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'verify': return 'Forensic Recruitment Verification';
      case 'evidence': return 'Extracted Evidence Matrix';
      case 'dna': return '9-Dimensional Recruitment DNA';
      case 'scam-intel': return 'Syndicate Intelligence Registry';
      case 'history': return 'Case Audit Registry';
      case 'reports': return 'Evidentiary Reports & Certification';
      case 'system': return 'System Architecture & Health';
      default: return 'Recruitment Verification';
    }
  };

  const getBreadcrumb = (tab) => {
    switch (tab) {
      case 'verify': return 'Verification Console';
      case 'evidence': return 'Evidence Matrix';
      case 'dna': return 'Recruitment DNA';
      case 'scam-intel': return 'Syndicate Intelligence';
      case 'history': return 'Case History';
      case 'reports': return 'Reports';
      case 'system': return 'System Diagnostics';
      default: return 'Console';
    }
  };

  const displayCaseId = currentCaseId || 'TG-2026-00128';

  const copyCaseId = () => {
    navigator.clipboard.writeText(displayCaseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-header)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 80
    }}>
      {/* Left: Breadcrumbs & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px'
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>TrustGraph Core</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{getBreadcrumb(activeTab)}</span>
          </div>
          <h1 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-heading)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Case ID, Engine Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Active Case ID Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>CASE:</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{displayCaseId}</span>
          <button
            onClick={copyCaseId}
            title="Copy Case ID"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
              marginLeft: '2px'
            }}
          >
            {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Engine Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--color-success)'
        }}>
          <span
            className="pulse-indicator"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)'
            }}
          />
          <span>ONLINE</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="btn-secondary"
          style={{
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} style={{ color: '#F59E0B' }} />
              <span style={{ color: 'var(--text-heading)' }}>Light</span>
            </>
          ) : (
            <>
              <Moon size={14} style={{ color: '#6366F1' }} />
              <span style={{ color: 'var(--text-heading)' }}>Dark</span>
            </>
          )}
        </button>

      </div>
    </header>
  );
}
