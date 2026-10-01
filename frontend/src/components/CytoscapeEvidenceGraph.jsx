import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Layers } from 'lucide-react';

export default function CytoscapeEvidenceGraph({ graphData, caseId, theme = 'dark' }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const isLight = theme === 'light';

  // Fallback demo evidence graph
  const defaultGraphData = {
    nodes: [
      { data: { id: 'msg_01', label: 'Recruitment Message', type: 'InputMessage', status: 'SOURCE' } },
      { data: { id: 'org_01', label: 'Claimed Organization', type: 'Organization', status: 'VERIFIED' } },
      { data: { id: 'dom_01', label: 'Application Domain', type: 'Domain', status: 'CONFLICT' } },
      { data: { id: 'contact_01', label: 'Helpline Contact', type: 'Phone', status: 'CONFLICT' } },
      { data: { id: 'mail_01', label: 'Contact Mailbox', type: 'Email', status: 'CONFLICT' } },
      { data: { id: 'pay_01', label: 'Payment Account', type: 'Payment', status: 'SCAM' } },
      { data: { id: 'risk_01', label: 'Risk Reasoning: HIGH', type: 'Verdict', status: 'SCAM' } }
    ],
    edges: [
      { data: { id: 'e1', source: 'msg_01', target: 'org_01', label: 'CLAIMS_ORG', status: 'VERIFIED' } },
      { data: { id: 'e2', source: 'msg_01', target: 'dom_01', label: 'USES_PORTAL', status: 'CONFLICT' } },
      { data: { id: 'e3', source: 'msg_01', target: 'contact_01', label: 'PROVIDES_PHONE', status: 'CONFLICT' } },
      { data: { id: 'e4', source: 'msg_01', target: 'mail_01', label: 'PROVIDES_EMAIL', status: 'CONFLICT' } },
      { data: { id: 'e5', source: 'msg_01', target: 'pay_01', label: 'DEMANDS_UPI', status: 'SCAM' } },
      { data: { id: 'pay_01', source: 'pay_01', target: 'risk_01', label: 'FLAGGED_BY_RULES', status: 'SCAM' } }
    ]
  };

  const activeData = (graphData && graphData.nodes && graphData.nodes.length > 0) ? graphData : defaultGraphData;

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...activeData.nodes.map(n => ({
        group: 'nodes',
        data: {
          ...n.data,
          displayLabel: `${n.data.type || 'Entity'}:\n${n.data.label || n.data.id}`
        }
      })),
      ...activeData.edges.map(e => ({
        group: 'edges',
        data: e.data
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(displayLabel)',
            'text-wrap': 'wrap',
            'text-max-width': '110px',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px',
            'color': isLight ? '#0F172A' : '#F8FAFC',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': isLight ? '#F1F5F9' : '#162033',
            'border-width': '2px',
            'border-color': isLight ? '#94A3B8' : '#38BDF8',
            'width': '65px',
            'height': '65px',
            'text-outline-color': isLight ? '#FFFFFF' : '#080C14',
            'text-outline-width': '2px',
            'overlay-opacity': 0
          }
        },
        {
          selector: 'node[type = "InputMessage"], node[type = "Notification"]',
          style: {
            'background-color': isLight ? '#E0F2FE' : '#0F2744',
            'border-color': '#0284C7',
            'width': '72px',
            'height': '72px',
            'font-weight': 'bold'
          }
        },
        {
          selector: 'node[status = "VERIFIED"], node[status = "DEMO VERIFIED"]',
          style: {
            'background-color': isLight ? '#ECFDF5' : '#0B2E1E',
            'border-color': isLight ? '#059669' : '#10B981',
            'color': isLight ? '#065F46' : '#F8FAFC'
          }
        },
        {
          selector: 'node[status = "CONFLICT"], node[status = "SCAM"]',
          style: {
            'background-color': isLight ? '#FFF1F2' : '#3B1219',
            'border-color': isLight ? '#E11D48' : '#F43F5E',
            'color': isLight ? '#9F1239' : '#F8FAFC'
          }
        },
        {
          selector: 'node[status = "SUSPICIOUS"]',
          style: {
            'background-color': isLight ? '#FFFBEB' : '#3B290B',
            'border-color': isLight ? '#D97706' : '#F59E0B',
            'color': isLight ? '#92400E' : '#F8FAFC'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': isLight ? '#0284C7' : '#FFFFFF',
            'border-width': '3px',
            'shadow-blur': 14,
            'shadow-color': '#38BDF8',
            'shadow-opacity': 0.6
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': isLight ? '#CBD5E1' : '#2D3E5B',
            'target-arrow-color': isLight ? '#CBD5E1' : '#2D3E5B',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'color': isLight ? '#64748B' : '#94A3B8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-background-color': isLight ? '#FFFFFF' : '#0A0F1A',
            'text-background-opacity': 0.9,
            'text-background-padding': '2px'
          }
        },
        {
          selector: 'edge[status = "CONFLICT"], edge[status = "SCAM"]',
          style: {
            'line-color': isLight ? '#E11D48' : '#F43F5E',
            'target-arrow-color': isLight ? '#E11D48' : '#F43F5E',
            'line-style': 'dashed',
            'width': 2
          }
        },
        {
          selector: 'edge[status = "VERIFIED"]',
          style: {
            'line-color': isLight ? '#059669' : '#10B981',
            'target-arrow-color': isLight ? '#059669' : '#10B981'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.25,
        animate: false
      }
    });

    cy.on('tap', 'node', (evt) => {
      setSelectedNode(evt.target.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [activeData, isLight]);

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit(30);
  const handleResetLayout = () => {
    if (!cyRef.current) return;
    const layout = cyRef.current.layout({
      name: 'breadthfirst',
      directed: true,
      padding: 40,
      spacingFactor: 1.25,
      animate: true,
      animationDuration: 300
    });
    layout.run();
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '420px',
      backgroundColor: 'var(--graph-bg)',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)'
    }}>
      {/* Top Legend Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
          <span style={{ color: 'var(--text-heading)' }}>Verified</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
          <span style={{ color: 'var(--text-heading)' }}>Conflict / Scam</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
          <span style={{ color: 'var(--text-heading)' }}>Entity</span>
        </div>
      </div>

      {/* Control Buttons Toolbar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="btn-secondary"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="btn-secondary"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="btn-secondary"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <Maximize2 size={13} />
        </button>
        <button
          onClick={handleResetLayout}
          title="Reset Layout"
          className="btn-secondary"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Main Canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '10px 14px',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>INSPECTED NODE: </span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedNode.type}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>—</span>
            <span style={{ color: 'var(--text-heading)' }}>{selectedNode.label || selectedNode.id}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: selectedNode.status === 'VERIFIED' ? 'var(--color-success-bg)' : selectedNode.status === 'SCAM' || selectedNode.status === 'CONFLICT' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)',
              color: selectedNode.status === 'VERIFIED' ? 'var(--color-success)' : selectedNode.status === 'SCAM' || selectedNode.status === 'CONFLICT' ? 'var(--color-danger)' : 'var(--accent-primary)',
              border: '1px solid currentColor'
            }}>
              {selectedNode.status || 'UNKNOWN'}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '2px 6px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
