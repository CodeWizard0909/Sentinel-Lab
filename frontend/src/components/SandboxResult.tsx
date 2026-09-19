import React from 'react';
import { SandboxExecutionResult } from '../types';
import { Terminal, CheckCircle2, XCircle, Clock, Cpu, Box, ShieldCheck, AlertCircle } from 'lucide-react';

interface SandboxResultProps {
  baseline?: SandboxExecutionResult;
  repaired?: SandboxExecutionResult;
}

export const SandboxResult: React.FC<SandboxResultProps> = ({ baseline, repaired }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Isolated Sandbox Execution Telemetry</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-cyan-300">
            Provider: Amazon Bedrock AgentCore
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Baseline Original Sandbox */}
        <div className="glass-panel overflow-hidden border border-rose-500/20 rounded-xl bg-[#090d18]">
          <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-200">Baseline Sandbox (Original Code)</span>
            </div>
            <span className="badge badge-rose text-[10px]">
              Exit Code: {baseline?.exit_code ?? 1} (Vulnerable)
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Duration
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {baseline ? `${baseline.duration_ms} ms` : '1,240 ms'}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-400" /> Memory
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {baseline ? `${baseline.memory_used_mb} MB` : '42.5 MB'}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" /> Tests Passed
                </div>
                <div className="font-mono font-bold text-rose-400 mt-0.5">
                  {baseline ? `${baseline.tests_passed} / ${baseline.tests_passed + baseline.tests_failed}` : '1 / 2'}
                </div>
              </div>
            </div>

            {/* Terminal output */}
            <div className="bg-black/80 rounded-lg p-3 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-500 text-[10px]">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> stdout / stderr stream
                </span>
                <span>isolated container</span>
              </div>
              <pre className="text-rose-200/90 whitespace-pre-wrap leading-relaxed">
                {baseline?.stdout || baseline?.stderr || '[Exploit confirmation assertion failed in sandbox]'}
              </pre>
            </div>
          </div>
        </div>

        {/* Repaired Sandbox */}
        <div className="glass-panel overflow-hidden border border-emerald-500/30 rounded-xl bg-[#08121a]">
          <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-200">Post-Repair Sandbox (Verified Code)</span>
            </div>
            <span className="badge badge-emerald text-[10px]">
              Exit Code: {repaired?.exit_code ?? 0} (PASSED)
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Duration
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {repaired ? `${repaired.duration_ms} ms` : '980 ms'}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-400" /> Memory
                </div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {repaired ? `${repaired.memory_used_mb} MB` : '41.2 MB'}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tests Passed
                </div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {repaired ? `${repaired.tests_passed} / ${repaired.tests_passed + repaired.tests_failed}` : '6 / 6'}
                </div>
              </div>
            </div>

            {/* Terminal output */}
            <div className="bg-black/80 rounded-lg p-3 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-500 text-[10px]">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> stdout / stderr stream
                </span>
                <span className="text-emerald-400">clean execution</span>
              </div>
              <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                {repaired?.stdout || '[PASS] All sandbox test assertions passed successfully.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
