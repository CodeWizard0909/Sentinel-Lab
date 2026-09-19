import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Floating Pill Container in Neural Style */}
        <div className="w-full neural-pill py-2.5 px-4 sm:px-6 flex items-center justify-between">
          
          {/* Brand Logo with Double-Slash Mark */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <svg className="w-5 h-4" viewBox="0 0 23 17" aria-hidden="true" fill="currentColor">
                <path d="M8.15 0.9 L4.55 0.9 L0.5 9.3 L4.1 9.3 Z" />
                <path d="M17.0 0 L13.4 0 L6.15 16.4 L9.75 16.4 Z" />
                <path d="M22.9 0 L19.3 0 L15.0 7.6 L18.6 7.6 Z" />
                <path d="M22.6 6.9 L19.0 6.9 L14.05 16.4 L17.65 16.4 Z" />
              </svg>
              <span className="text-sm font-semibold tracking-wider text-white uppercase weight-531">
                SENTINEL<span className="text-zinc-400 font-normal">LAB</span>
              </span>
            </Link>

            {/* System Online Status Dot */}
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-white/10 text-[11px] font-mono text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-tight text-[10px] text-zinc-300">SYSTEM ONLINE</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-zinc-300">
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              className={`transition-colors hover:text-white weight-506 ${location.pathname === '/' ? 'text-white' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="transition-colors hover:text-white weight-506"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="transition-colors hover:text-white weight-506"
            >
              Security
            </button>
            <Link
              to="/architecture"
              className={`transition-colors hover:text-white weight-506 ${location.pathname === '/architecture' ? 'text-white' : ''}`}
            >
              Architecture
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scrollToSection('killer-demo')}
              className="text-[12px] font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Demo Spec
            </button>

            {/* Neural Pill CTA Button */}
            <Link
              to="/upload"
              className="cta-glass px-4 py-1.5 text-xs font-medium text-white shadow-sm flex items-center gap-2 group active:scale-95"
            >
              <span className="weight-506">Get Started</span>
              <svg className="w-2.5 h-2.5 stroke-white" viewBox="0 0 10 9" fill="none" strokeWidth="1.4">
                <path d="M0 4.5 H9.1 M5.4 0.9 L9.2 4.5 L5.4 8.1" />
              </svg>
            </Link>
          </div>

          {/* Mobile Burger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/upload"
              className="cta-glass px-3 py-1 text-xs text-white"
            >
              <span>Start</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="mt-2 w-full neural-card p-4 sm:hidden flex flex-col gap-3 shadow-2xl animate-fade-up">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SYSTEM ONLINE</span>
            </div>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-zinc-200 py-1 weight-506"
            >
              Overview
            </Link>
            <button
              onClick={() => scrollToSection('workflow')}
              className="text-left text-sm text-zinc-200 py-1 weight-506"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="text-left text-sm text-zinc-200 py-1 weight-506"
            >
              Security
            </button>
            <Link
              to="/architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-zinc-200 py-1 weight-506"
            >
              Architecture
            </Link>
            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full py-2.5 rounded-full cta-glass text-center text-xs font-medium text-white"
            >
              Get Started →
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
