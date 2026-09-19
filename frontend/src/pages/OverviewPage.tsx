import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowDown, 
  Terminal, 
  CheckCircle2, 
  Box, 
  Check, 
  Play
} from 'lucide-react';

const AGENTS = [
  {
    id: 'analyzer',
    name: 'Code Analyzer',
    role: 'AST & Dependency Graphing',
    badge: 'AST / Lexer',
    description: 'Constructs syntax trees, parses data flows, and maps potential attack surfaces across the repository.'
  },
  {
    id: 'security',
    name: 'Security Agent',
    role: 'CWE Heuristics & Exploits',
    badge: 'OWASP / CWE',
    description: 'Executes automated vulnerability matching against CWE-89, CWE-79, and modern API security vectors.'
  },
  {
    id: 'repair',
    name: 'Repair Agent',
    role: 'Minimal Semantic Patching',
    badge: 'Neural Patching',
    description: 'Generates non-breaking, idiomatic fixes utilizing parameterized boundaries and secure primitives.'
  },
  {
    id: 'sandbox',
    name: 'Sandbox Agent',
    role: 'Bedrock AgentCore Sandbox',
    badge: 'Isolated Container',
    description: 'Provisions an ephemeral micro-container to execute exploit payloads and regression suites safely.'
  },
  {
    id: 'judge',
    name: 'Judge Agent',
    role: 'Deterministic Verification',
    badge: 'Pass/Fail Verdict',
    description: 'Evaluates test coverage, exit codes, and AST regression deltas to issue a cryptographically signed verdict.'
  }
];

export const OverviewPage: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string>('sandbox');
  const [demoStep, setDemoStep] = useState<number>(7);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);

  const demoLogs = [
    { text: '> Reproducing SQL injection exploit...', status: 'warn' },
    { text: '> Original vulnerability confirmed: admin auth bypass.', status: 'fail' },
    { text: '> Applying AI-generated patch to database.js:42...', status: 'info' },
    { text: '> Re-running exploit in isolated sandbox...', status: 'info' },
    { text: '> Exploit blocked: Parameter binding enforced.', status: 'success' },
    { text: '> Running regression tests across 14 test suites...', status: 'info' },
    { text: '> 14/14 tests passed with zero functional delta.', status: 'success' },
  ];

  const handlePlayDemo = () => {
    setDemoStep(0);
    setIsPlayingDemo(true);
  };

  useEffect(() => {
    if (!isPlayingDemo) return;
    if (demoStep < demoLogs.length) {
      const timer = setTimeout(() => {
        setDemoStep((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsPlayingDemo(false);
    }
  }, [isPlayingDemo, demoStep, demoLogs.length]);

  return (
    <div className="relative z-10 w-full flex flex-col text-white">
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 pt-28 pb-16 text-center relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Eyebrow in Neural Pill style */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 neural-pill text-[11px] font-mono tracking-widest text-[#a2a9b8] uppercase mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>AI SOFTWARE VERIFICATION / AWS POWERED</span>
          </div>

          {/* Large Headline with Instrument Serif & Sora */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.06] font-normal tracking-tight text-white mb-8 weight-424">
            Don’t trust AI-generated code.{' '}
            <span className="block sm:inline font-serif italic text-white/95 drop-shadow-sm font-light">
              Prove it.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl text-base sm:text-lg text-[#a2a9b8] leading-relaxed font-normal mb-10 weight-446">
            SentinelLab analyzes your code, detects vulnerabilities, generates repairs, and proves those repairs inside an isolated sandbox before you ship.
          </p>

          {/* Actions with Neural Signature CTA Glass */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Link
              to="/upload"
              className="cta-glass px-8 py-3.5 text-sm font-medium text-white shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto active:scale-95 group"
            >
              <span className="weight-497 text-white">Get Started</span>
              <svg className="w-4 h-3 stroke-white" viewBox="0 0 16 11" fill="none" strokeWidth="1.6" strokeLinecap="square">
                <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8" />
              </svg>
            </Link>
            
            <a
              href="#workflow"
              className="neural-pill px-6 py-3.5 text-sm text-[#a2a9b8] hover:text-white flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
            >
              <span>See how it works</span>
              <ArrowDown className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* Floating System-Status Strip */}
          <div className="neural-pill py-2.5 px-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] font-mono text-[#a2a9b8]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[#e2ebf5]">BEDROCK CONNECTED</span>
            </div>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-[#e2ebf5]">5 AGENTS ACTIVE</span>
            </div>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[#e2ebf5]">SANDBOX ISOLATED</span>
            </div>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-[#e2ebf5]">VERIFICATION READY</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WORKFLOW SECTION */}
      <section id="workflow" className="relative py-28 px-4 sm:px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[11px] font-mono tracking-widest text-[#a2a9b8] uppercase">THE VERIFICATION PIPELINE</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mt-2 font-light">
              From suggestion to proof.
            </h2>
            <p className="text-sm sm:text-base text-[#a2a9b8] mt-3 weight-446">
              Five deterministic stages transform untested AI code into formally validated software.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            
            {/* Step 1 */}
            <div className="neural-card p-5 flex flex-col justify-between group">
              <div>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">01</span>
                <h3 className="text-base font-semibold text-white mt-1 weight-531">UPLOAD</h3>
                <p className="text-xs text-[#a2a9b8] mt-2 leading-relaxed">Project source and reproduction exploit harness.</p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Source Archive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="neural-card p-5 flex flex-col justify-between group">
              <div>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">02</span>
                <h3 className="text-base font-semibold text-white mt-1 weight-531">ANALYZE</h3>
                <p className="text-xs text-[#a2a9b8] mt-2 leading-relaxed">Static AST evaluation + OWASP vulnerability scan.</p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>AST & Heuristics</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="neural-card p-5 flex flex-col justify-between group">
              <div>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">03</span>
                <h3 className="text-base font-semibold text-white mt-1 weight-531">REPAIR</h3>
                <p className="text-xs text-[#a2a9b8] mt-2 leading-relaxed">AI-synthesized minimal, regression-free code patch.</p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Claude 3.5 Sonnet</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Step 4: SANDBOX (Highlighted with subtle blue glow) */}
            <div className="neural-card p-5 flex flex-col justify-between border-sky-400/50 shadow-lg shadow-sky-500/15 relative overflow-hidden group scale-[1.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-xl pointer-events-none rounded-full" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sky-400">04</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Core Isolation
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mt-1 flex items-center gap-1.5 weight-531">
                  <span>SANDBOX</span>
                  <Box className="w-4 h-4 text-sky-400" />
                </h3>
                <p className="text-xs text-[#e2ebf5] mt-2 leading-relaxed">
                  Zero-network execution container running exploit payloads.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-sky-500/20 flex items-center justify-between text-[11px] font-mono text-sky-300">
                <span>Bedrock AgentCore</span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              </div>
            </div>

            {/* Step 5 */}
            <div className="neural-card p-5 flex flex-col justify-between group">
              <div>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">05</span>
                <h3 className="text-base font-semibold text-white mt-1 weight-531">VERIFY</h3>
                <p className="text-xs text-[#a2a9b8] mt-2 leading-relaxed">Differential testing pass & cryptographically certified fix.</p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span>14/14 Tests Passed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MULTI-AGENT SECTION */}
      <section id="security" className="relative py-28 px-4 sm:px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono tracking-widest text-[#a2a9b8] uppercase">AUTONOMOUS COOPERATIVE INTELLIGENCE</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mt-2 font-light">
              One problem. Five specialized minds.
            </h2>
            <p className="text-sm sm:text-base text-[#a2a9b8] mt-3 weight-446">
              Instead of a single fallible prompt, SentinelLab coordinates specialized neural workers around an AWS Bedrock orchestrator.
            </p>
          </div>

          {/* Technical Visual Network in Neural Container */}
          <div className="neural-card p-6 sm:p-10 relative overflow-hidden">
            
            {/* Center Orchestrator */}
            <div className="flex flex-col items-center mb-10">
              <div className="neural-pill px-6 py-3 border-sky-400/40 flex items-center gap-3 shadow-lg shadow-sky-500/10">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="text-xs font-mono tracking-wider uppercase text-white font-semibold weight-531">
                  Sentinel Orchestrator Core
                </span>
                <span className="text-[10px] font-mono text-sky-400 border-l border-white/10 pl-2">
                  AWS Bedrock Agent
                </span>
              </div>
              <div className="h-8 w-[1px] bg-gradient-to-b from-sky-500/40 to-white/10 my-1" />
            </div>

            {/* Specialized Minds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {AGENTS.map((agent) => {
                const isSelected = activeAgent === agent.id;
                return (
                  <div
                    key={agent.id}
                    onMouseEnter={() => setActiveAgent(agent.id)}
                    onClick={() => setActiveAgent(agent.id)}
                    className={`cursor-pointer neural-card p-5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-400/60 shadow-xl shadow-sky-500/10 scale-[1.02]'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                          {agent.badge}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'}`} />
                      </div>
                      <h4 className="text-sm font-semibold text-white weight-531">{agent.name}</h4>
                      <p className="text-[11px] font-mono text-[#a2a9b8] mt-0.5">{agent.role}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#a2a9b8] leading-snug">
                      {agent.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footnote */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#a2a9b8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Deterministic Zero-Trust Sandbox Feedback Loop</span>
              </div>
              <div className="text-zinc-500">
                Runtime: Amazon Bedrock Claude 3.5 Sonnet v2
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. KILLER DEMO SECTION */}
      <section id="killer-demo" className="relative py-28 px-4 sm:px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono tracking-widest text-[#a2a9b8] uppercase">PROVE THE PATCH</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mt-2 font-light">
              AI says it’s fixed. SentinelLab proves it.
            </h2>
            <p className="text-sm sm:text-base text-[#a2a9b8] mt-3 weight-446">
              See the exact comparison between vulnerable dynamic string queries and verified parameterized isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Code Comparison (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Before Panel - Red */}
              <div className="neural-card p-5 border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-mono text-red-400 font-semibold tracking-wide">
                      BEFORE REPAIR
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
                    SQL INJECTION · HIGH SEVERITY
                  </span>
                </div>

                <div className="bg-[#02060f] rounded-xl p-4 font-mono text-xs text-red-200/90 border border-red-500/20 overflow-x-auto">
                  <div className="text-zinc-500 text-[11px] mb-1">// database.js:42 — Vulnerable user query</div>
                  <div className="diff-line-removed p-2 rounded">
                    db.query("SELECT * FROM users WHERE id=" + id)
                  </div>
                </div>
                <p className="text-[11px] text-[#a2a9b8] mt-3">
                  Direct concatenation allows attacker to inject <code className="text-red-300 font-mono">1 OR 1=1</code> to bypass auth checks.
                </p>
              </div>

              {/* After Panel - Green */}
              <div className="neural-card p-5 border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wide">
                      AFTER REPAIR
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    PARAMETERIZED BINDING · PASS
                  </span>
                </div>

                <div className="bg-[#02060f] rounded-xl p-4 font-mono text-xs text-emerald-200/90 border border-emerald-500/20 overflow-x-auto">
                  <div className="text-zinc-500 text-[11px] mb-1">// database.js:42 — Parameterized secure query</div>
                  <div className="diff-line-added p-2 rounded">
                    db.query("SELECT * FROM users WHERE id=?", [id])
                  </div>
                </div>
                <p className="text-[11px] text-[#a2a9b8] mt-3">
                  Input sanitized and bound as literal parameter. Zero risk of query structure manipulation.
                </p>
              </div>

            </div>

            {/* Right: Terminal Verification Panel (5 cols) */}
            <div className="lg:col-span-5 neural-card p-5 flex flex-col justify-between bg-[#02060f]/90">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono text-[#e2ebf5]">SANDBOX TEST EXECUTION</span>
                  </div>
                  <button
                    onClick={handlePlayDemo}
                    disabled={isPlayingDemo}
                    className="neural-pill px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Replay</span>
                  </button>
                </div>

                {/* Animated Logs */}
                <div className="mt-4 space-y-2 font-mono text-xs min-h-[220px]">
                  {demoLogs.slice(0, demoStep).map((log, idx) => (
                    <div 
                      key={idx}
                      className={`leading-relaxed animate-fade-up ${
                        log.status === 'fail' ? 'text-red-400' :
                        log.status === 'warn' ? 'text-amber-400' :
                        log.status === 'success' ? 'text-emerald-400' :
                        'text-[#a2a9b8]'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))}
                  {demoStep < demoLogs.length && (
                    <div className="flex items-center gap-1 text-sky-400 text-xs font-mono pt-1">
                      <span className="inline-block w-1.5 h-3 bg-sky-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Verdict Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">SANDBOX HARNESS VERDICT</span>
                  <div className="text-sm font-semibold text-white weight-531">AWS AgentCore Verified</div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>VERIFIED</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="relative py-32 px-4 sm:px-6 border-t border-white/5 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white mb-6 font-light">
            Ready to test what your AI wrote?
          </h2>
          
          <p className="text-base sm:text-lg text-[#a2a9b8] max-w-xl mb-10 leading-relaxed weight-446">
            Upload a project. Let the agents investigate. Let the sandbox prove it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/upload"
              className="cta-glass px-8 py-3.5 text-sm font-medium text-white shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto active:scale-95 group"
            >
              <span className="weight-497 text-white">Get Started</span>
              <svg className="w-4 h-3 stroke-white" viewBox="0 0 16 11" fill="none" strokeWidth="1.6" strokeLinecap="square">
                <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8" />
              </svg>
            </Link>
            
            <Link
              to="/architecture"
              className="neural-pill px-7 py-3.5 text-sm text-[#a2a9b8] hover:text-white flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
            >
              <span>View Architecture</span>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};
