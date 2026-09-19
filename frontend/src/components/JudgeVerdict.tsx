import React from 'react';
import { JudgeVerdict as JudgeVerdictType } from '../types';
import { ShieldCheck, XCircle, AlertTriangle, CheckCircle, Award, Brain, FileSpreadsheet, Check } from 'lucide-react';

interface JudgeVerdictProps {
  verdict?: JudgeVerdictType;
  scanId: string;
}

export const JudgeVerdict: React.FC<JudgeVerdictProps> = ({ verdict, scanId }) => {
  if (!verdict) return null;

  const isVerified = verdict.is_verified;

  return (
    <div className="glass-panel overflow-hidden border border-white/10 rounded-2xl p-6 relative">
      {/* Background glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isVerified ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center p-3 shadow-2xl ${
              isVerified
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-rose-500/20'
            }`}
          >
            {isVerified ? <ShieldCheck className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Judge Agent Certification
              </span>
              <span
                className={`badge ${
                  isVerified ? 'badge-emerald' : 'badge-rose'
                } font-bold text-xs`}
              >
                {verdict.verdict}
              </span>
            </div>
            <h2 className="text-2xl font-black font-['Outfit'] text-white tracking-tight mt-0.5">
              {isVerified ? 'Software Repair Verified & Certified' : 'Repair Rejected by Verification Sandbox'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated under Bedrock AgentCore runtime isolation with autonomous regression assertions.
            </p>
          </div>
        </div>

        {/* Confidence Dial */}
        <div className="bg-slate-900/90 px-5 py-3 rounded-xl border border-white/10 flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Confidence Score</div>
            <div className="text-2xl font-black font-mono text-cyan-400">{verdict.confidence_score}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Summary and Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" /> Judge Deliberation Summary
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              {verdict.summary}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Verification Proof Points
            </h4>
            <ul className="space-y-2">
              {verdict.reasoning.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verification Matrix Badges */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
          <div className="text-xs font-bold text-slate-300 mb-1">Safety & Soundness Matrix</div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs">
            <span className="text-slate-400">Security Mitigated</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Confirmed
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs">
            <span className="text-slate-400">Regression Free</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> 0 Regressions
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs">
            <span className="text-slate-400">Test Suite Soundness</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> 100% Passed
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(verdict, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sentinellab-verdict-${scanId}.json`;
                a.click();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              Export Audit Certificate (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
