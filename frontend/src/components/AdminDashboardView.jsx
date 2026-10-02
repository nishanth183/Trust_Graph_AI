import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import {
  Users,
  Shield,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  User,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare,
  Globe,
  Camera,
  ArrowLeft,
  Eye
} from 'lucide-react';

export default function AdminDashboardView({ authToken, onSelectCase }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userCases, setUserCases] = useState({});
  const [loadingCases, setLoadingCases] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserCases = async (userId) => {
    if (userCases[userId]) return; // already cached
    setLoadingCases(userId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/cases`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserCases(prev => ({ ...prev, [userId]: data.cases || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch cases for ${userId}:`, err);
    } finally {
      setLoadingCases(null);
    }
  };

  const toggleExpand = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      fetchUserCases(userId);
    }
  };

  const getVerdictBadge = (verdict, score) => {
    if (verdict === 'GENUINE' || score >= 75) {
      return <span className="tg-pill tg-pill-verified" style={{ fontSize: '11px' }}>
        <CheckCircle2 size={12} /> Genuine
      </span>;
    }
    if (verdict === 'SCAM' || score < 40) {
      return <span className="tg-pill tg-pill-warning" style={{ fontSize: '11px' }}>
        <AlertCircle size={12} /> High Risk
      </span>;
    }
    return <span className="tg-pill tg-pill-caution" style={{ fontSize: '11px' }}>
      <AlertTriangle size={12} /> Caution
    </span>;
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                View all registered users and their case histories
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="tg-btn-ghost"
          style={{ padding: '8px 14px' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="tg-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Users
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {users.length}
          </div>
        </div>
        <div className="tg-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Admin Users
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="tg-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Cases
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
            {users.reduce((sum, u) => sum + (u.total_cases || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="tg-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, username, email..."
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

      {/* Users List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="tg-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="tg-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.user_id} className="tg-card" style={{ overflow: 'hidden' }}>
              {/* User Row */}
              <div
                onClick={() => toggleExpand(user.user_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                className="tg-row-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    backgroundColor: user.role === 'admin' ? 'var(--color-primary-light)' : 'var(--bg-card-subtle)',
                    color: user.role === 'admin' ? 'var(--color-primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${user.role === 'admin' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    flexShrink: 0
                  }}>
                    {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {user.full_name}
                      </span>
                      <span className={`tg-pill ${user.role === 'admin' ? 'tg-pill-info' : 'tg-pill-neutral'}`}
                        style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      @{user.username} · {user.email || 'No email'} · Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.total_cases || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      cases
                    </div>
                  </div>
                  {expandedUserId === user.user_id ? (
                    <ChevronDown size={18} color="var(--text-muted)" />
                  ) : (
                    <ChevronRight size={18} color="var(--text-muted)" />
                  )}
                </div>
              </div>

              {/* Expanded Case List */}
              {expandedUserId === user.user_id && (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card-subtle)',
                  padding: '16px 20px'
                }}>
                  {loadingCases === user.user_id ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                      Loading cases...
                    </div>
                  ) : (userCases[user.user_id] || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No cases found for this user.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Case History for {user.full_name}
                      </div>
                      {(userCases[user.user_id] || []).map((c, idx) => (
                        <div
                          key={c.case_id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              backgroundColor: 'var(--bg-card-subtle)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FileText size={14} color="var(--text-muted)" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {c.case_id}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.extracted_evidence?.organization || 'Government Department'} · Score: {c.trust_score}/100
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            {getVerdictBadge(c.verdict, c.trust_score)}
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '70px', textAlign: 'right' }}>
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : ''}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCase && onSelectCase(c);
                              }}
                              className="tg-btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '11px' }}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
