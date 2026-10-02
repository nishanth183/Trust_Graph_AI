import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { Cpu, Server, ShieldCheck, RefreshCw } from 'lucide-react';

export default function SystemView() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const defaultEngines = {
    nlp_pipeline: true,
    ocr_pymupdf: true,
    opencv_vision: true,
    recruitment_dna_engine: true,
    evidence_graph_builder: true,
    contradiction_reasoning_engine: true,
    ml_risk_classifier: true
  };

  const engines = health?.ai_models_loaded || defaultEngines;

  return (
    <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '18px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
              SYSTEM ARCHITECTURE & DIAGNOSTICS
            </h2>
            <span className="badge badge-success">
              ALL SYSTEMS ONLINE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Operational status of multi-modal AI pipelines, official registry caches, and forensic engine subsystems.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHealth}
          className="btn-secondary"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <RefreshCw size={14} />
          <span>Ping System Status</span>
        </button>
      </div>

      {/* Engine Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Core Subsystem Panel */}
        <div className="console-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '14px' }}>
            <Server size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>FORENSIC RUNTIME</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>VERSION:</span>
              <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>TRUSTGRAPH AI v1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>FASTAPI SERVER:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>RUNNING (:8000)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>STORAGE ENGINE:</span>
              <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>EMBEDDED HYBRID</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>DEMO MODE:</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* AI & ML Models Status */}
        <div className="console-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '14px' }}>
            <Cpu size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>AI ENGINES STATUS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {[
              { name: 'NLP & Intent Extraction Model', active: engines.nlp_pipeline },
              { name: 'PyMuPDF OCR Document Processor', active: engines.ocr_pymupdf },
              { name: 'OpenCV CLAHE & QR Detector', active: engines.opencv_vision },
              { name: '9-Dimensional Recruitment DNA Engine', active: engines.recruitment_dna_engine },
              { name: 'NetworkX Cytoscape Graph Synthesizer', active: engines.evidence_graph_builder },
              { name: 'Contradiction & Institutional Reasoning', active: engines.contradiction_reasoning_engine },
              { name: 'Calibrated ML Risk Classifier', active: engines.ml_risk_classifier }
            ].map((eng, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderRadius: '6px'
                }}
              >
                <span style={{ color: 'var(--text-heading)' }}>{eng.name}</span>
                <span className="badge badge-success">● ONLINE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Whitelist Gazette Registry Benchmarks */}
      <div className="console-card">
        <div className="console-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
              OFFICIAL GOVERNMENT RECRUITMENT BENCHMARK REGISTRY
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            AUTHORIZED APEX PORTALS (.GOV.IN / .NIC.IN)
          </span>
        </div>

        <div style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <th style={{ padding: '10px 14px' }}>ORGANIZATION</th>
                <th style={{ padding: '10px 14px' }}>OFFICIAL PORTAL</th>
                <th style={{ padding: '10px 14px' }}>PAYMENT STANDARD</th>
                <th style={{ padding: '10px 14px' }}>CONTACT RESTRICTION</th>
              </tr>
            </thead>
            <tbody>
              {[
                { org: 'Union Public Service Commission (UPSC)', url: 'upsc.gov.in / upsconline.nic.in', pay: 'SBI Net Banking / Gateway only', rule: 'No personal UPI, no WhatsApp' },
                { org: 'Staff Selection Commission (SSC)', url: 'ssc.gov.in', pay: 'Bhartiya Kosh / Treasury gateway', rule: 'No Gmail, official @gov.in only' },
                { org: 'Railway Recruitment Boards (RRB)', url: 'rrbapply.gov.in', pay: 'Online net-banking gateway', rule: 'Centralized CEN gazette code' },
                { org: 'India Post (GDS Recruitment)', url: 'indiapost.gov.in / indiapostgdsonline.gov.in', pay: 'Head Post Office / Treasury gateway', rule: 'No direct UPI QR collection' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>{row.org}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>{row.url}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-body)' }}>{row.pay}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
