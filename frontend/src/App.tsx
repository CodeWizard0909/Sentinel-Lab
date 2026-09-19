import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LaunchpadPage } from './pages/LaunchpadPage';
import { ScanDashboardPage } from './pages/ScanDashboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SentinelApiService } from './services/api';

export const App: React.FC = () => {
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  const handleToggleMock = (enabled: boolean) => {
    setIsMockMode(enabled);
    SentinelApiService.setMockMode(enabled);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-white">
        <Header isMockMode={isMockMode} onToggleMockMode={handleToggleMock} />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<LaunchpadPage />} />
            <Route path="/dashboard" element={<ScanDashboardPage />} />
            <Route path="/results/:scanId" element={<ResultsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>SENTINELLAB &copy; AWS Hackathon — Autonomous AI Sandbox Verification</span>
            <span className="text-slate-400">Powered by Amazon Bedrock & AgentCore</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
