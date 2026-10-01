import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import CheckJobView from './components/CheckJobView';
import CasesView from './components/CasesView';
import ScamIntelView from './components/ScamIntelView';
import HelpView from './components/HelpView';
import AboutView from './components/AboutView';
import FeedbackModal from './components/FeedbackModal';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import AdminDashboardView from './components/AdminDashboardView';
import { Shield, PhoneCall, ExternalLink, Heart } from 'lucide-react';
import './App.css';

// Auth helper: get stored auth
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('trustgraph_auth');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

export default function App() {
  // Auth state
  const [authUser, setAuthUser] = useState(() => getStoredAuth());
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'

  const [activeTab, setActiveTab] = useState('home');
  const [selectedCaseResult, setSelectedCaseResult] = useState(null);
  const [preloadedDemoKey, setPreloadedDemoKey] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingCaseId, setReportingCaseId] = useState(null);

  // Theme Management (Light / Dark)
  // Default to light to match the civic-tech reference interface
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('trustgraph_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('trustgraph_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ─── Auth Handlers ─────────────────────────────────────────────────────────

  const handleLogin = (data) => {
    const user = {
      token: data.token,
      user_id: data.user_id,
      username: data.username,
      full_name: data.full_name,
      role: data.role
    };
    setAuthUser(user);
    localStorage.setItem('trustgraph_auth', JSON.stringify(user));
    setActiveTab('home');
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('trustgraph_auth');
    setActiveTab('home');
  };

  // ─── Navigation Handlers ───────────────────────────────────────────────────

  const handleOpenReport = (caseId) => {
    setReportingCaseId(caseId);
    setFeedbackModalOpen(true);
  };

  const handleLoadDemo = (caseKey) => {
    setSelectedCaseResult(null);
    setPreloadedDemoKey(caseKey);
    setActiveTab('check');
  };

  const handleSelectCaseFromHistory = (rawCase) => {
    setSelectedCaseResult(rawCase);
    setPreloadedDemoKey(null);
    setActiveTab('check');
  };

  const handleStartNewCheck = () => {
    setSelectedCaseResult(null);
    setPreloadedDemoKey(null);
    setActiveTab('check');
  };

  // ─── Show Login/Register if not authenticated ──────────────────────────────

  if (!authUser) {
    if (authScreen === 'register') {
      return (
        <RegisterView
          onRegister={handleLogin}
          onSwitchToLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginView
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthScreen('register')}
      />
    );
  }

  // ─── Authenticated App ─────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. Civic Tech Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'check' && activeTab !== 'check') {
            // Keep current result or clean slate
          }
          setActiveTab(tab);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoadDemo={handleLoadDemo}
        authUser={authUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Content View Router */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'home' && (
          <HomeView
            onStartVerification={handleStartNewCheck}
            onLoadDemoCase={handleLoadDemo}
          />
        )}

        {activeTab === 'check' && (
          <CheckJobView
            preloadedDemo={preloadedDemoKey}
            initialResult={selectedCaseResult}
            onOpenReportModal={handleOpenReport}
            theme={theme}
            authToken={authUser?.token}
          />
        )}

        {activeTab === 'cases' && (
          <CasesView
            onSelectCase={handleSelectCaseFromHistory}
            onStartNewCheck={handleStartNewCheck}
            authToken={authUser?.token}
          />
        )}

        {activeTab === 'admin' && authUser?.role === 'admin' && (
          <AdminDashboardView
            authToken={authUser?.token}
            onSelectCase={handleSelectCaseFromHistory}
          />
        )}

        {activeTab === 'intelligence' && (
          <ScamIntelView />
        )}

        {activeTab === 'help' && (
          <HelpView
            onStartCheck={handleStartNewCheck}
          />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>

      {/* 3. Civic Platform Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-card)',
        padding: '32px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Left Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                TrustGraph AI
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Evidence Before Trust · Civic Cyber Safety Platform
              </div>
            </div>
          </div>

          {/* Center Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span 
              onClick={() => setActiveTab('check')}
              style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            >
              Check a Job
            </span>
            <span 
              onClick={() => setActiveTab('cases')}
              style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            >
              My Checks
            </span>
            <span 
              onClick={() => setActiveTab('help')}
              style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            >
              Help & FAQ
            </span>
            <span 
              onClick={() => setActiveTab('about')}
              style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            >
              About
            </span>
            <a 
              href="https://cybercrime.gov.in" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Right: Emergency 1930 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <PhoneCall size={14} />
            <span>National Cyber Helpline: 1930</span>
          </div>
        </div>

        <div style={{
          maxWidth: '1100px',
          margin: '20px auto 0',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            Cross-referenced against verified Indian Government Gazette databases (.gov.in & .nic.in).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built for citizen safety across India
          </div>
        </div>
      </footer>

      {/* Audit Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        caseId={reportingCaseId}
      />
    </div>
  );
}
