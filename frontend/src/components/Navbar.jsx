import React from 'react';
import { Shield, Sun, Moon, Sparkles, PhoneCall, ChevronDown, User, LogOut, Settings, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, onToggleTheme, onLoadDemo, authUser, onLogout }) {
  const [demoMenuOpen, setDemoMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isAdmin = authUser?.role === 'admin';

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'check', label: 'Check a Job' },
    { id: 'cases', label: 'My Checks' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'help', label: 'Help' },
    { id: 'about', label: 'About' }
  ];

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.demo-menu-container')) setDemoMenuOpen(false);
      if (!e.target.closest('.user-menu-container')) setUserMenuOpen(false);
      if (!e.target.closest('.tg-mobile-drawer') && !e.target.closest('.tg-nav-mobile-toggle')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--bg-nav)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-card)',
      padding: '0 24px',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
        }}>
          <Shield size={22} />
        </div>
        <div>
          <div style={{
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.1
          }}>
            TrustGraph AI
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            Evidence Before Trust.
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="tg-nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      {/* Right Actions: Demo Selector, User Menu & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Demo Preset Dropdown */}
        <div className="demo-menu-container tg-nav-hide-tablet" style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDemoMenuOpen(prev => !prev);
              setUserMenuOpen(false);
            }}
            className="tg-btn-secondary"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Sparkles size={14} color="var(--color-primary)" />
            <span>Demo</span>
            <ChevronDown size={14} />
          </button>

          {demoMenuOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '260px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase' }}>
                Preloaded Cases
              </div>
              <button
                onClick={() => {
                  onLoadDemo('demo_case_01');
                  setDemoMenuOpen(false);
                }}
                className="tg-btn-ghost"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '8px 10px' }}
              >
                <span className="tg-pill tg-pill-verified" style={{ fontSize: '10px', padding: '2px 6px' }}>GENUINE</span>
                <span style={{ fontSize: '12px' }}>UPSC Civil Services</span>
              </button>
              <button
                onClick={() => {
                  onLoadDemo('demo_case_02');
                  setDemoMenuOpen(false);
                }}
                className="tg-btn-ghost"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '8px 10px' }}
              >
                <span className="tg-pill tg-pill-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>SCAM</span>
                <span style={{ fontSize: '12px' }}>India Post GDS (UPI Fee)</span>
              </button>
              <button
                onClick={() => {
                  onLoadDemo('demo_case_rrb');
                  setDemoMenuOpen(false);
                }}
                className="tg-btn-ghost"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '8px 10px' }}
              >
                <span className="tg-pill tg-pill-caution" style={{ fontSize: '10px', padding: '2px 6px' }}>DOMAIN</span>
                <span style={{ fontSize: '12px' }}>Railway RRB (.online)</span>
              </button>
            </div>
          )}
        </div>

        {/* Cyber Helpline 1930 */}
        <div className="tg-nav-hide-tablet" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <PhoneCall size={13} color="var(--color-primary)" />
          <span>1930</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="tg-btn-ghost"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
        >
          {theme === 'dark' ? (
            <Sun size={18} style={{ color: '#F59E0B' }} />
          ) : (
            <Moon size={18} style={{ color: '#6366F1' }} />
          )}
        </button>

        {/* User Menu */}
        {authUser && (
          <div className="user-menu-container" style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(prev => !prev);
                setDemoMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'none',
                border: '1px solid var(--border-card)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isAdmin ? 'var(--color-primary-light)' : 'var(--bg-card-subtle)',
                color: isAdmin ? 'var(--color-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${isAdmin ? 'var(--color-primary)' : 'var(--border-subtle)'}`
              }}>
                {isAdmin ? <Shield size={13} /> : <User size={13} />}
              </div>
              <span className="tg-nav-hide-mobile" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {authUser.full_name || authUser.username}
              </span>
              <span className="tg-nav-hide-mobile"><ChevronDown size={14} color="var(--text-muted)" /></span>
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '220px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {/* User info */}
                <div style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {authUser.full_name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    @{authUser.username} · {authUser.role.toUpperCase()}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => { setActiveTab('admin'); setUserMenuOpen(false); }}
                    className="tg-btn-ghost"
                    style={{ justifyContent: 'flex-start', padding: '8px 12px', width: '100%' }}
                  >
                    <Settings size={14} />
                    <span style={{ fontSize: '13px' }}>Admin Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('cases'); setUserMenuOpen(false); }}
                  className="tg-btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', width: '100%' }}
                >
                  <User size={14} />
                  <span style={{ fontSize: '13px' }}>My Cases</span>
                </button>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                <button
                  onClick={() => { onLogout(); setUserMenuOpen(false); }}
                  className="tg-btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', width: '100%', color: 'var(--color-danger)' }}
                >
                  <LogOut size={14} />
                  <span style={{ fontSize: '13px' }}>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Hamburger Toggle Button (shown only <= 900px) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(prev => !prev);
            setDemoMenuOpen(false);
            setUserMenuOpen(false);
          }}
          className="tg-btn-ghost tg-nav-mobile-toggle"
          aria-label="Toggle navigation menu"
          style={{ width: '38px', height: '38px', padding: 0, borderRadius: '8px' }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Navigation Drawer (shown only when mobileMenuOpen is true on <= 900px) */}
      {mobileMenuOpen && (
        <div
          className="tg-mobile-drawer open"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            width: '100%',
            height: 'calc(100vh - 60px)',
            maxHeight: 'calc(100dvh - 60px)',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-lg)',
            padding: '24px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            zIndex: 1000
          }}
        >
          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '8px' }}>
              Menu
            </span>
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    background: isActive ? 'var(--color-primary-light)' : 'transparent',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{link.label}</span>
                  {isActive && <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>●</span>}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Quick Demo Preloaded Cases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '8px' }}>
              Quick Demo Cases
            </span>
            <button
              onClick={() => { onLoadDemo('demo_case_01'); setMobileMenuOpen(false); }}
              className="tg-btn-ghost"
              style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: '13px' }}
            >
              <span className="tg-pill tg-pill-verified" style={{ fontSize: '10px', padding: '2px 6px' }}>GENUINE</span>
              <span>UPSC Civil Services</span>
            </button>
            <button
              onClick={() => { onLoadDemo('demo_case_02'); setMobileMenuOpen(false); }}
              className="tg-btn-ghost"
              style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: '13px' }}
            >
              <span className="tg-pill tg-pill-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>SCAM</span>
              <span>India Post GDS (UPI Fee)</span>
            </button>
            <button
              onClick={() => { onLoadDemo('demo_case_rrb'); setMobileMenuOpen(false); }}
              className="tg-btn-ghost"
              style={{ justifyContent: 'flex-start', padding: '10px 12px', fontSize: '13px' }}
            >
              <span className="tg-pill tg-pill-caution" style={{ fontSize: '10px', padding: '2px 6px' }}>DOMAIN</span>
              <span>Railway RRB (.online)</span>
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Cyber Helpline 1930 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cybercrime Helpline</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)' }}>1930</span>
          </div>

          {/* User Session & Logout */}
          {authUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '12px',
              marginTop: 'auto'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{authUser.full_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{authUser.username} · {authUser.role?.toUpperCase()}</div>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="tg-btn-secondary"
                style={{ fontSize: '12px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
