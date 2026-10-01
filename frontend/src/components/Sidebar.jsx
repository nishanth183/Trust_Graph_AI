import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Dna, 
  Network, 
  History, 
  FileText, 
  Cpu, 
  X,
  Shield,
  LifeBuoy
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'verify', label: 'Verify Console', icon: ShieldCheck, badge: 'CORE' },
    { id: 'evidence', label: 'Evidence Matrix', icon: Layers, badge: null },
    { id: 'dna', label: 'Recruitment DNA', icon: Dna, badge: '9D' },
    { id: 'scam-intel', label: 'Syndicate Intel', icon: Network, badge: null },
    { id: 'history', label: 'Case History', icon: History, badge: null },
    { id: 'reports', label: 'Audit Reports', icon: FileText, badge: null },
    { id: 'system', label: 'System Health', icon: Cpu, badge: null }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 90,
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
        className={mobileOpen ? 'sidebar-mobile-open' : 'sidebar-desktop'}
      >
        {/* Top Brand Block */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px var(--accent-glow)'
            }}>
              <Shield size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-heading)'
                }}>
                  TrustGraph
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#FFFFFF',
                  background: 'var(--accent-primary)',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  AI
                </span>
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                Evidence Investigation
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'none',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dimmed)',
            fontWeight: 700,
            padding: '6px 10px 8px 10px',
            fontFamily: 'var(--font-mono)'
          }}>
            Forensic Workspaces
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '7px',
                  backgroundColor: isActive ? 'var(--bg-active-pill)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-body)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                    e.currentTarget.style.color = 'var(--text-heading)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-body)';
                  }
                }}
              >
                <Icon size={17} style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  flexShrink: 0
                }} />
                
                <span style={{ flex: 1 }}>{item.label}</span>

                {item.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System & Helpline Block */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>MHA CYBER HELPLINE</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>1930</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-dimmed)',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>v1.0.0 ENTERPRISE</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              SECURE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
