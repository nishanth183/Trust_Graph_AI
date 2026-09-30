import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import VerifyView from './components/VerifyView';
import ResultView from './components/ResultView';
import GraphView from './components/GraphView';
import DNAView from './components/DNAView';
import ScamIntelView from './components/ScamIntelView';
import CaseHistoryView from './components/CaseHistoryView';
import AboutView from './components/AboutView';
import FeedbackModal from './components/FeedbackModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentResult, setCurrentResult] = useState(null);
  const [preloadedDemoKey, setPreloadedDemoKey] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingCaseId, setReportingCaseId] = useState(null);

  const handleStartVerification = () => {
    setActiveTab('verify');
  };

  const handleLoadDemoCase = (demoKey) => {
    setPreloadedDemoKey(demoKey);
    setActiveTab('verify');
  };

  const handleAnalyzeSuccess = (resultData) => {
    setCurrentResult(resultData);
    setActiveTab('result');
  };

  const handleSelectCaseFromHistory = (caseItem) => {
    setCurrentResult(caseItem);
    setActiveTab('result');
  };

  const handleOpenReport = (caseId) => {
    setReportingCaseId(caseId);
    setFeedbackModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasResult={currentResult !== null} 
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView 
            onStartVerification={handleStartVerification} 
            onLoadDemoCase={handleLoadDemoCase} 
          />
        )}

        {activeTab === 'verify' && (
          <VerifyView 
            onAnalyzeSuccess={handleAnalyzeSuccess} 
            preloadedDemo={preloadedDemoKey} 
          />
        )}

        {activeTab === 'result' && (
          <ResultView 
            result={currentResult} 
            onViewGraph={() => setActiveTab('graph')} 
            onViewDNA={() => setActiveTab('dna')} 
            onReportCase={handleOpenReport} 
          />
        )}

        {activeTab === 'graph' && (
          <GraphView 
            graphData={currentResult?.evidence_graph} 
            caseId={currentResult?.case_id} 
          />
        )}

        {activeTab === 'dna' && (
          <DNAView 
            dnaData={currentResult?.recruitment_dna} 
            caseId={currentResult?.case_id} 
          />
        )}

        {activeTab === 'scam-intel' && (
          <ScamIntelView />
        )}

        {activeTab === 'history' && (
          <CaseHistoryView 
            onSelectCase={handleSelectCaseFromHistory} 
          />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b',
        backgroundColor: 'rgba(9, 13, 22, 0.95)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>TRUSTGRAPH AI</strong> &copy; 2026. AI-Based Fake Government Job & Recruitment Scam Detection System.
          </div>
          <div>
            "We don't trust the message; we trust the evidence."
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#34d399' }}>● Demo Mode Active</span>
            <span style={{ color: '#38bdf8' }}>● Cyber Helpline 1930</span>
          </div>
        </div>
      </footer>

      {/* Reporting Feedback Modal */}
      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)} 
        caseId={reportingCaseId} 
      />

    </div>
  );
}
