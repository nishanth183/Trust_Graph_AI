import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import {
  Shield,
  UserPlus,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Badge,
  ArrowRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function RegisterView({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim() || !formData.full_name.trim()) {
      setError('Username, full name, and password are required.');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          email: formData.email.trim() || null,
          role: formData.role
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed.');
      }

      const data = await res.json();
      onRegister(data);
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.3)'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Create Your Account
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Join TrustGraph AI to check and track recruitment verification
          </p>
        </div>

        {/* Registration Card */}
        <div className="tg-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <Badge size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className="tg-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Username *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Choose a username"
                  className="tg-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Email (optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="tg-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Account Type
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'user')}
                  className={formData.role === 'user' ? 'tg-btn-primary' : 'tg-btn-secondary'}
                  style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }}
                >
                  <User size={15} />
                  <span>User</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'admin')}
                  className={formData.role === 'admin' ? 'tg-btn-primary' : 'tg-btn-secondary'}
                  style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }}
                >
                  <Shield size={15} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create a password (min 4 chars)"
                  className="tg-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  className="tg-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="tg-btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSwitchToLogin}
            className="tg-btn-ghost"
            style={{ fontSize: '14px', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </button>
        </div>

      </div>
    </div>
  );
}
