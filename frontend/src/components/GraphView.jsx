import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export default function GraphView({ graphData, caseId }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Fallback demo graph if no current case is loaded
  const fallbackGraph = {
    nodes: [
      { data: { id: 'notif_demo', label: 'CEN 09/2026-RAIL', type: 'Notification', status: 'NOT_FOUND' } },
      { data: { id: 'org_demo', label: 'Railway Recruitment Boards', type: 'Organization', status: 'VERIFIED' } },
      { data: { id: 'dom_demo', label: 'rrb-recruitment-gov.online', type: 'Domain', status: 'CONFLICT' } },
      { data: { id: 'email_demo', label: 'rrb.support.desk@gmail.com', type: 'Email', status: 'CONFLICT' } },
      { data: { id: 'phone_demo', label: '+918765432109', type: 'Phone', status: 'CONFLICT' } },
      { data: { id: 'prev_demo', label: 'Case: TG-2026-DEMO-002', type: 'CaseHistory', status: 'CONFLICT' } }
    ],
    edges: [
      { data: { id: 'e1', source: 'notif_demo', target: 'org_demo', label: 'PUBLISHED_BY', status: 'UNKNOWN' } },
      { data: { id: 'e2', source: 'notif_demo', target: 'dom_demo', label: 'USES_DOMAIN', status: 'CONFLICT' } },
      { data: { id: 'e3', source: 'notif_demo', target: 'email_demo', label: 'USES_EMAIL', status: 'CONFLICT' } },
      { data: { id: 'e4', source: 'notif_demo', target: 'phone_demo', label: 'CONTACTED_BY', status: 'CONFLICT' } },
      { data: { id: 'e5', source: 'phone_demo', target: 'prev_demo', label: 'CONNECTED_TO', status: 'CONFLICT' } }
    ],
    total_nodes: 6,
    total_edges: 5,
    suspicious_edges_count: 4
  };

  const activeGraph = (graphData && graphData.nodes && graphData.nodes.length > 0) ? graphData : fallbackGraph;

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert nodes & edges to cytoscape format
    const cyElements = [
      ...activeGraph.nodes.map(n => ({
        group: 'nodes',
        data: {
          ...n.data,
          displayLabel: `${n.data.type}:\n${n.data.label}`
        }
      })),
      ...activeGraph.edges.map(e => ({
        group: 'edges',
        data: e.data
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(displayLabel)',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'font-size': '11px',
            'color': '#f8fafc',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': '#090d16',
            'text-outline-width': '2px',
            'background-color': '#3b82f6',
            'width': '65px',
            'height': '65px',
            'border-width': '2px',
            'border-color': '#ffffff'
          }
        },
        // Status colors
        {
          selector: 'node[status = "VERIFIED"], node[status = "DEMO VERIFIED"]',
          style: {
            'background-color': '#10b981',
            'border-color': '#34d399'
          }
        },
        {
          selector: 'node[status = "CONFLICT"], node[status = "SCAM"]',
          style: {
            'background-color': '#ef4444',
            'border-color': '#f87171'
          }
        },
        {
          selector: 'node[status = "SUSPICIOUS"]',
          style: {
            'background-color': '#f59e0b',
            'border-color': '#fbbf24'
          }
        },
        {
          selector: 'node[type = "Notification"]',
          style: {
            'shape': 'round-rectangle',
            'width': '80px',
            'height': '55px'
          }
        },
        {
          selector: 'node[type = "Organization"]',
          style: {
            'shape': 'hexagon',
            'width': '80px',
            'height': '60px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#64748b',
            'line-color': '#334155',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-background-opacity': 0.8,
            'text-background-color': '#090d16',
            'text-background-padding': '2px'
          }
        },
        {
          selector: 'edge[status = "CONFLICT"]',
          style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'width': 3,
            'color': '#fca5a5'
          }
        },
        {
          selector: 'edge[status = "VERIFIED"]',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            'width': 2,
            'color': '#86efac'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': '4px',
            'border-color': '#38bdf8',
            'line-color': '#38bdf8'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.4
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [activeGraph]);

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit();

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Evidence Graph Intelligence</h1>
            <span className="badge badge-genuine">NetworkX + Cytoscape Engine</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Visualizes relationships between recruitment entities, detecting repeated syndicate infrastructure and institutional contradictions.
          </p>
        </div>

        {/* Graph Summary Metrics */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>{activeGraph.total_nodes}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Entities</div>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#a855f7' }}>{activeGraph.total_edges}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Relationships</div>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>{activeGraph.suspicious_edges_count}</div>
            <div style={{ fontSize: '10px', color: '#f87171' }}>Conflicts</div>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '20px' }}>
        
        {/* Graph Canvas Container */}
        <div className="glass-card" style={{
          position: 'relative',
          height: '620px',
          background: 'rgba(9, 13, 22, 0.95)',
          overflow: 'hidden'
        }}>
          
          {/* Canvas Controls */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <button onClick={handleZoomIn} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px' }} title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <button onClick={handleZoomOut} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px' }} title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleFit} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: '4px' }} title="Fit View">
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span>Verified Official</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span>Conflict / Scam Infrastructure</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <span>Suspicious / Unverified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
              <span>Neutral Entity</span>
            </div>
          </div>

          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="glass-card" style={{ padding: '24px', height: '620px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Entity Inspector</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Entity Type</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>{selectedNode.type}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Entity Value</div>
              <div style={{ fontSize: '14px', fontWeight: 600, wordBreak: 'break-all' }}>{selectedNode.label}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Status</div>
              <span className={`badge ${selectedNode.status === 'VERIFIED' ? 'badge-genuine' : (selectedNode.status === 'CONFLICT' ? 'badge-scam' : 'badge-suspicious')}`}>
                {selectedNode.status}
              </span>
            </div>

            {selectedNode.reason && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>
                  Scam Syndicate Linkage Reason:
                </div>
                <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                  {selectedNode.reason}
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#94a3b8', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <strong>TrustGraph Tip:</strong> Nodes flagged as <code>CONFLICT</code> indicate unauthorized private infrastructure impersonating government departments.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
