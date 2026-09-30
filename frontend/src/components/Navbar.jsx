import React from 'react';
import { Shield, Network, Dna, FileSearch, Database, Info, History, AlertTriangle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, hasResult }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'verify', label: 'Verify Recruitment', icon: FileSearch },
    ...(hasResult ? [{ id: 'result', label: 'Analysis Result', icon: AlertTriangle }] : []),
    { id: 'graph', label: 'Evidence Graph', icon: Network },
    { id: 'dna', label: 'Recruitment DNA', icon: Dna },
    { id: 'scam-intel', label: 'Scam Intelligence', icon: Database },
    { id: 'history', label: 'Case History', icon: History },
    { id: 'about', label: 'About System', icon: Info },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                TRUSTGRAPH <span className="gradient-text-cyan">AI</span>
              </span>
              <span className="badge badge-demo" style={{ fontSize: '10px', padding: '2px 8px' }}>
                DEMO MODE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Fake Government Job & Scam Detection
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* System Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#34d399',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span>AI Evidence Engine Ready</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
