import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SentinelApiService } from '../services/api';
import { ScanResult, Issue } from '../types';
import { JudgeVerdict } from '../components/JudgeVerdict';
import { CodeDiff } from '../components/CodeDiff';
import { SandboxResult } from '../components/SandboxResult';
import { IssueCard } from '../components/IssueCard';
import { Shield, Sparkles, AlertTriangle, ArrowLeft, Download, RefreshCw, Layers } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'sandbox' | 'issues'>('diff');

  useEffect(() => {
    if (scanId) {
      SentinelApiService.getScanById(scanId).then((res) => {
        if (res) {
          setScan(res);
          if (res.issues && res.issues.length > 0) {
            setSelectedIssue(res.issues[0]);
          }
        }
      });
    }
  }, [scanId]);

  if (!scan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="inline-block p-4 rounded-full bg-slate-900 border border-white/10 text-cyan-400 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-slate-400 font-mono text-xs">Loading verification audit for scan {scanId}...</p>
      </div>
    );
  }

  const primaryRepair = scan.repairs && scan.repairs.length > 0 ? scan.repairs[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Launchpad
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Scan ID: {scan.scan_id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-['Outfit'] text-white">
            {scan.project_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Verification
          </Link>
        </div>
      </div>

      {/* 1. Judge Verdict Component */}
      <JudgeVerdict verdict={scan.verdict} scanId={scan.scan_id} />

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'diff'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Patch & Code Diff</span>
          {scan.repairs?.length ? (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800/60">
              {scan.repairs.length}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'sandbox'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>AWS Isolated Sandbox Results</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'issues'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Detected Vulnerabilities</span>
          {scan.issues?.length ? (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-400 text-[10px] font-mono border border-rose-800/60">
              {scan.issues.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'diff' && (
          <div className="space-y-4">
            {primaryRepair ? (
              <CodeDiff repair={primaryRepair} />
            ) : (
              <div className="glass-panel p-8 text-center text-slate-400 text-xs">
                No code repairs generated for this project.
              </div>
            )}
          </div>
        )}

        {activeTab === 'sandbox' && (
          <SandboxResult
            baseline={scan.baseline_sandbox}
            repaired={scan.repaired_sandbox}
          />
        )}

        {activeTab === 'issues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scan.issues && scan.issues.length > 0 ? (
              scan.issues.map((iss) => (
                <IssueCard
                  key={iss.id}
                  issue={iss}
                  isSelected={selectedIssue?.id === iss.id}
                  onSelect={() => setSelectedIssue(iss)}
                />
              ))
            ) : (
              <div className="col-span-2 glass-panel p-8 text-center text-slate-400 text-xs">
                No issues detected. Code is safe.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
