import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { Shield, Network, Dna, Lock, AlertTriangle, ExternalLink, BookOpen, Layers, Landmark, PhoneCall } from 'lucide-react';

export default function AboutView() {
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/official-registry`)
      .then(res => res.json())
      .then(data => {
        if (data.official_organizations) {
          setRegistry(data.official_organizations);
        }
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Landmark size={14} />
          <span>EVIDENCE BEFORE TRUST</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          About TrustGraph AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0' }}>
          Explainable, evidence-grounded digital forensics platform to verify claimed government job notifications in India.
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="tg-card" style={{
        padding: '36px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
        borderColor: 'rgba(2, 132, 199, 0.25)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Product Philosophy
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontStyle: 'italic' }}>
          "We don't trust the message; we trust the evidence."
        </div>
        <p style={{ maxWidth: '680px', margin: '14px auto 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
          Rather than relying solely on black-box probabilistic text classifiers, TrustGraph AI grounds every check on institutional Gazette evidence, verified DNS and NIC domains, statutory payment rules, and graph forensic correlation.
        </p>
      </div>

      {/* Architectural Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <div className="tg-card" style={{ padding: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-info-bg)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Dna size={22} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Recruitment DNA
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A 9-dimensional digital feature genome encompassing organization, notification, domain, contact, visual seal, language style, layout, payment, and temporal signatures. Matches submitted documents against statutory civil service rules.
          </p>
        </div>

        <div className="tg-card" style={{ padding: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Network size={22} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Attributed Evidence Graph
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Models recruitment communications as entities and relationships using graph analytics. Discloses hidden connections to previously reported scam syndicates and flags repeating illicit payment infrastructure.
          </p>
        </div>
      </div>

      {/* Official Government Portals Directory */}
      <div className="tg-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Verified Government Recruitment Directory
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Legitimate central recruitment bodies indexed in TrustGraph AI's verified database.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {registry.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading official registry...</div>
          ) : (
            registry.map((org) => (
              <div 
                key={org.key}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  padding: '18px',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {org.organization}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '6px' }}>
                  Official Domains: {org.official_domains.join(', ')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Notices: {org.sample_notifications.join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cyber Safety Hotline Notice */}
      <div style={{
        backgroundColor: 'var(--color-danger-bg)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <PhoneCall size={24} color="#DC2626" />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626' }}>
              National Cyber Crime Reporting Helpline 1930
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              If you have been targeted by recruitment scammers or made payments, immediately dial <strong>1930</strong> or register a complaint on cybercrime.gov.in.
            </p>
          </div>
        </div>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noreferrer"
          className="tg-btn-primary"
          style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 20px', backgroundColor: '#DC2626', borderColor: '#DC2626' }}
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}
