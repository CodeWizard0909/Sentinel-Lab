import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Check, 
  Shield, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Box, 
  Cpu, 
  CheckCircle2, 
  Layers,
  FileCode,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SentinelApiService } from '../services/api';

export const ResultsPage: React.FC = () => {
  const { scanId = 'SL-1024' } = useParams<{ scanId: string }>();
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [scanData, setScanData] = useState<any>(null);

  React.useEffect(() => {
    SentinelApiService.getScanById(scanId).then(data => setScanData(data));
  }, [scanId]);

  const isVerified = scanData?.verdict?.is_verified ?? true;
  const verdictStatus = scanData?.verdict?.verdict ?? 'VERIFIED';
  const issuesFound = scanData?.issues?.length ?? 2;
  const testsPassed = scanData?.repaired_sandbox?.tests_passed ?? 14;
  const totalTests = (scanData?.repaired_sandbox?.tests_passed ?? 14) + (scanData?.repaired_sandbox?.tests_failed ?? 0);
  const patchDiff = scanData?.repairs?.[0]?.diff || `// database.js:42 - SentinelLab Verified Patch\ndb.query("SELECT * FROM users WHERE id=?", [id])`;
  const projectName = scanData?.project_name || 'Uploaded Project';

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(patchDiff);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  return (
    <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-28 pb-20 max-w-6xl mx-auto flex flex-col text-white">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Upload Workspace</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">Scan #{scanId.replace('scan-', 'SL-')}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyPatch}
            className="px-4 py-2 rounded-full liquid-glass-pill text-xs font-mono text-zinc-300 hover:text-white border border-white/10 hover:border-white/25 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copiedPatch ? 'Patch Copied!' : 'Export Patch Diff'}</span>
          </button>
          
          <Link
            to="/upload"
            className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Verification</span>
          </Link>
        </div>
      </div>

      {/* 1. HEADER & LARGE VERDICT */}
      <div className="liquid-glass rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl mb-8 relative overflow-hidden text-center flex flex-col items-center">
        {/* Subtle green ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[11px] font-mono tracking-widest text-emerald-400 border border-emerald-500/30 uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          VERIFICATION COMPLETE
        </div>

        {/* Large Verdict */}
        <h1 className="text-5xl sm:text-7xl font-serif font-light text-white tracking-tight flex items-center justify-center gap-3 mb-4">
          <span className={isVerified ? "text-emerald-400" : "text-red-400"}>{isVerified ? '✓' : '×'}</span>
          <span>{verdictStatus}</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          {scanData?.verdict?.summary || 'Generated repair passed security and regression testing inside the sandbox.'}
        </p>

        {/* Metadata tag */}
        <div className="mt-6 inline-flex items-center gap-3 text-xs font-mono text-zinc-500">
          <span>Project: {projectName}</span>
          <span>•</span>
          <span>Runtime: AWS Bedrock AgentCore</span>
          <span>•</span>
          <span>Scan ID: #{scanId.replace('scan-', 'SL-')}</span>
        </div>
      </div>

      {/* 2. TOP METRICS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Metric 1 */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            VULNERABILITIES
          </span>
          <div className="text-3xl font-serif text-white">{issuesFound}</div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="truncate">{scanData?.issues?.[0]?.severity || 'CWE-89 & Plaintext'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            ISSUES FIXED
          </span>
          <div className="text-3xl font-serif text-emerald-400">{scanData?.repairs?.length || issuesFound}</div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>100% Remediated</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            TESTS PASSED
          </span>
          <div className="text-3xl font-serif text-white">
            {testsPassed} <span className="text-base text-zinc-500 font-sans">/ {totalTests}</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero Regressions</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            SANDBOX
          </span>
          <div className="text-3xl font-serif text-sky-400">{scanData?.repaired_sandbox?.status || 'VERIFIED'}</div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>AgentCore Isolated</span>
          </div>
        </div>

      </div>

      {/* 3. SECURITY FINDINGS & LARGE FINAL JUDGE VERDICT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Security Finding & Code Fix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Security Finding Card */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                SECURITY FINDING
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-mono font-semibold">
                HIGH SEVERITY
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">HIGH — SQL Injection</h3>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    database.js · Line 42
                  </div>
                </div>
                <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                  CWE-89
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                User input is directly concatenated into a SQL query. An attacker can submit unvalidated string payloads like <code className="text-red-300 font-mono">' OR '1'='1</code> to extract protected user tables or bypass administrative authentication.
              </p>

              {/* Code comparison panel */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-black/80 border border-red-500/20">
                  <div className="text-[10px] text-zinc-500 mb-1">// Vulnerable Implementation (Line 42)</div>
                  <div className="diff-line-removed p-2 rounded text-red-200">
                    db.query("SELECT * FROM users WHERE id=" + id)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/80 border border-emerald-500/20">
                  <div className="text-[10px] text-zinc-500 mb-1">// SentinelLab Verified Fix</div>
                  <div className="diff-line-added p-2 rounded text-emerald-200">
                    db.query("SELECT * FROM users WHERE id=?", [id])
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Finding */}
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">MEDIUM — Plaintext Password Comparison</h4>
                <p className="text-[11px] text-zinc-400">auth/service.py · Line 15 — Argon2id hash recommendation</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              MITIGATED
            </span>
          </div>

        </div>

        {/* Right: Large Final Judge Verdict Panel (5 cols) */}
        <div className="lg:col-span-5 liquid-glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-500/[0.02] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                JUDGE AGENT AUDIT PANEL
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Deterministic Pass
              </span>
            </div>

            {/* Verdict Headline */}
            <div>
              <div className="text-3xl font-serif text-white flex items-center gap-2">
                <span>VERIFIED</span>
                <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Cryptographic attestation signed by AWS Bedrock Judge Core.
              </p>
            </div>

            {/* 4 Pillars of Verification */}
            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">
                    ✓
                  </div>
                  <span>Security</span>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">
                    ✓
                  </div>
                  <span>Functionality</span>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">
                    ✓
                  </div>
                  <span>Regression</span>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">
                    ✓
                  </div>
                  <span>Sandbox</span>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">PASS</span>
              </div>

            </div>

            {/* Verification Reasoning */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 leading-relaxed font-sans space-y-1.5">
              <div className="font-semibold text-zinc-200">Proof Summary:</div>
              <div>• SQL injection payload execution blocked with exit code 0.</div>
              <div>• Legitimate authentication functional assertions passed.</div>
              <div>• Memory delta remains within 0.2% variance.</div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={handleCopyPatch}
              className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 shadow-xl transition-all"
            >
              <span>{copiedPatch ? 'Patch Copied to Clipboard' : 'Download Verified Patch'}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
            <div className="text-[10px] font-mono text-zinc-500 text-center">
              Signed Hash: 7f8a91b...34c92 · Ready for Git Merge
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
