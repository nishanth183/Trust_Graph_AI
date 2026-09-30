import React, { useEffect, useState } from 'react';
import { Shield, Network, Dna, Lock, AlertTriangle, ExternalLink, BookOpen, Layers } from 'lucide-react';

export default function AboutView() {
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    fetch('/api/official-registry')
      .then(res => res.json())
      .then(data => {
        if (data.official_organizations) {
          setRegistry(data.official_organizations);
        }
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>About TrustGraph AI</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px' }}>
          AI-Based Fake Government Job & Recruitment Scam Detection System
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '40px',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
          Foundational Product Principle
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', fontStyle: 'italic' }}>
          "We don't trust the message; we trust the evidence."
        </div>
        <p style={{ maxWidth: '720px', margin: '14px auto 0', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
          Rather than relying solely on superficial text classifiers, TrustGraph AI grounds decisions on verified institutional evidence, digital feature genomes, knowledge graph topology, and multi-factor contradiction reasoning.
        </p>
      </div>

      {/* Architectural Innovation Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Dna size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recruitment DNA</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
            A 9-dimensional digital feature genome encompassing organization, notification, domain, contact, visual, writing, layout, payment, and temporal signatures. Matches submitted documents against statutory civil service patterns.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Network size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Attributed Evidence Graph</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
            Models recruitment communications as entities and relationships using graph analytics. Discloses hidden connections to previously reported scam syndicates and flags repeated payment infrastructure.
          </p>
        </div>
      </div>

      {/* Official Government Portals Directory */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '48px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
          Curated Official Indian Recruitment Directory
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
          Legitimate recruitment bodies indexed in TrustGraph AI's verified knowledge base.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {registry.map((org) => (
            <div 
              key={org.key}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                borderRadius: '10px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc', marginBottom: '4px' }}>
                {org.organization}
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '6px' }}>
                Official Domains: {org.official_domains.join(', ')}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Sample Gazette Indices: {org.sample_notifications.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Safety Hotline Notice */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f87171' }}>
            National Cyber Crime Reporting Helpline
          </h4>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
            If you have been targeted by recruitment scammers or made payments, immediately dial <strong>1930</strong> or register a complaint on the official portal.
          </p>
        </div>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none', fontSize: '13px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}
