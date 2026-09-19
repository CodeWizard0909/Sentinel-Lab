import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { VideoBackground } from './components/VideoBackground';
import { OverviewPage } from './pages/OverviewPage';
import { UploadPage } from './pages/UploadPage';
import { ScanDashboardPage } from './pages/ScanDashboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex flex-col bg-black text-white selection:bg-white/20 selection:text-white">
        {/* Full Viewport Atmospheric Video Background */}
        <VideoBackground />

        {/* Floating Centered Pill Navbar */}
        <Header />

        {/* Primary Page Route Content */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<ScanDashboardPage />} />
            <Route path="/analysis" element={<ScanDashboardPage />} />
            <Route path="/results/:scanId" element={<ResultsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Minimalist Editorial Dark Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs font-mono text-zinc-400 bg-white/[0.03] backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-medium">SENTINELLAB</span>
              <span>— Autonomous Multi-Agent Software Verification</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <span>AWS Bedrock AgentCore</span>
              <span>•</span>
              <span>Zero-Trust Sandbox</span>
              <span>•</span>
              <span className="text-zinc-400">v2.4.0-verified</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
