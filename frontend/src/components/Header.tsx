import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Cpu, Box, Cloud, Database, Layers, Activity, CheckCircle2, Zap } from 'lucide-react';
import { SentinelApiService } from '../services/api';

interface HeaderProps {
  isMockMode: boolean;
  onToggleMockMode: (mock: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMockMode, onToggleMockMode }) => {
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState<{ status: string; aws_connected: boolean }>({
    status: 'checking',
    aws_connected: false,
  });

  useEffect(() => {
    SentinelApiService.checkHealth().then(res => setHealthStatus(res));
  }, []);

  const navLinks = [
    { path: '/', label: 'Launchpad', icon: Zap },
    { path: '/dashboard', label: 'Agent Pipeline', icon: Activity },
    { path: '/results/scan-sample-1', label: 'Verification Audit', icon: Shield },
    { path: '/architecture', label: 'AWS Architecture', icon: Cloud },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-['Outfit'] tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                SENTINEL<span className="text-cyan-400">LAB</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 rounded-full">
                AWS HACKATHON
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Agent AI Software Sandbox Verification</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path.startsWith('/results') && location.pathname.startsWith('/results'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* AWS Status & Mode Controls */}
        <div className="flex items-center gap-3">
          {/* AWS Service Badges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-lg border border-white/5 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Bedrock AgentCore: <strong className="text-cyan-300">Isolated Sandbox</strong>
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => onToggleMockMode(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isMockMode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Demo / Mock
            </button>
            <button
              onClick={() => onToggleMockMode(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !isMockMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Live AWS
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
