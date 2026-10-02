import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import {
  Shield,
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function LoginView({ onLogin, onSwitchToRegister }) {
  // 'user' | 'admin'
  const [activePortal, setActivePortal] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed. Please check your credentials.');
      }

      const data = await res.json();

      // Enforce portal-specific permissions
      if (activePortal === 'admin' && data.role !== 'admin') {
        throw new Error(
          `Access Denied: Account '${data.username}' is a Citizen account. Only Administrator accounts can log in through the Admin Portal. Please switch to Citizen Login.`
        );
      }

      onLogin(data);
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminPortal = activePortal === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '24px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: isAdminPortal ? '#0F172A' : 'var(--color-primary)',
            color: isAdminPortal ? '#F59E0B' : '#FFFFFF',
            border: isAdminPortal ? '2px solid #F59E0B' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: isAdminPortal
              ? '0 8px 25px rgba(245, 158, 11, 0.25)'
              : '0 8px 25px rgba(2, 132, 199, 0.3)',
            transition: 'all 0.2s ease'
          }}>
            {isAdminPortal ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            TrustGraph AI
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Evidence Before Trust · Recruitment Integrity System
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '6px',
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => handlePortalSwitch('user')}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: !isAdminPortal ? 'var(--bg-card)' : 'transparent',
              color: !isAdminPortal ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: !isAdminPortal ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            <span>Citizen Login</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: isAdminPortal ? 'var(--bg-card)' : 'transparent',
              color: isAdminPortal ? '#D97706' : 'var(--text-muted)',
              boxShadow: isAdminPortal ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={16} />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="tg-card" style={{
          padding: '32px',
          borderTop: isAdminPortal ? '4px solid #F59E0B' : '4px solid var(--color-primary)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAdminPortal ? 'Administrator Security Portal' : 'Citizen Verification Login'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isAdminPortal
                ? 'Authorized personnel only. View all users & audit records.'
                : 'Sign in to verify notices, track your cases & scam alerts.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isAdminPortal ? 'Admin Username' : 'Citizen Username'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAdminPortal ? 'Enter admin username' : 'Enter your username'}
                  className="tg-input"
                  style={{ paddingLeft: '42px', height: '46px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isAdminPortal ? 'Admin Security Password' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="tg-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '46px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="tg-btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1,
                backgroundColor: isAdminPortal ? '#0F172A' : undefined,
                borderColor: isAdminPortal ? '#334155' : undefined
              }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>{isAdminPortal ? 'Enter Admin Console' : 'Sign In as Citizen'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Fill Helper */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            backgroundColor: isAdminPortal ? 'var(--color-caution-bg)' : 'var(--color-info-bg)',
            border: `1px solid ${isAdminPortal ? 'var(--color-caution-border)' : 'var(--color-info-border)'}`,
            borderRadius: '10px',
            fontSize: '12px',
            color: isAdminPortal ? 'var(--color-caution-text)' : 'var(--color-info-text)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>{isAdminPortal ? 'Admin Test Credentials' : 'Demo Citizen Credentials'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isAdminPortal) {
                    handleQuickFill('admin', 'admin123');
                  } else {
                    handleQuickFill('testuser', 'password123');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Auto-fill
              </button>
            </div>
            <div>
              {isAdminPortal
                ? 'Username: admin · Password: admin123'
                : 'Username: testuser · Password: password123'}
            </div>
          </div>
        </div>

        {/* Footer Switcher */}
        {!isAdminPortal ? (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Don't have a citizen account?{' '}
            </span>
            <button
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Need an admin account? Contact the system nodal officer.</span>
          </div>
        )}

      </div>
    </div>
  );
}
