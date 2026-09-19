import React, { useState } from 'react';
import { RepairProposal } from '../types';
import { Copy, Check, FileCode, Sparkles, Download, Layers, Columns } from 'lucide-react';

interface CodeDiffProps {
  repair: RepairProposal;
}

export const CodeDiff: React.FC<CodeDiffProps> = ({ repair }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const handleCopy = () => {
    navigator.clipboard.writeText(repair.repaired_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const element = document.createElement('a');
    const file = new Blob([repair.diff || repair.repaired_code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${repair.file_path.replace(/[/\\?%*:|"<>]/g, '_')}.patch`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="glass-panel overflow-hidden border border-white/10 rounded-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">{repair.file_path}</span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
            AI Generated Patch
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3 h-3" /> Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                viewMode === 'unified' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" /> Unified Diff
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-white/10 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadPatch}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .patch</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="px-4 py-2.5 bg-cyan-950/20 border-b border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">Repair Rationale: </span>
          <span>{repair.explanation}</span>
          <span className="ml-2 text-[10px] text-slate-400 font-mono">({repair.model_used})</span>
        </div>
      </div>

      {/* Code Display Area */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 text-xs font-mono">
          {/* Original */}
          <div className="bg-[#0a0f1d] flex flex-col">
            <div className="px-4 py-2 bg-rose-950/30 text-rose-300 text-[11px] font-semibold border-b border-white/5 flex items-center justify-between">
              <span>Original Vulnerable Code</span>
              <span className="text-[10px] font-mono text-rose-400">Target for Sandbox Fail</span>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed text-[12px] flex-1">
              <code>{repair.original_code}</code>
            </pre>
          </div>

          {/* Repaired */}
          <div className="bg-[#09131e] flex flex-col">
            <div className="px-4 py-2 bg-emerald-950/30 text-emerald-300 text-[11px] font-semibold border-b border-white/5 flex items-center justify-between">
              <span>Verified Repaired Code</span>
              <span className="text-[10px] font-mono text-emerald-400">Sandbox Validated</span>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-100 leading-relaxed text-[12px] flex-1">
              <code>{repair.repaired_code}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0f1d] p-4 overflow-x-auto font-mono text-xs">
          <pre className="text-slate-300 leading-relaxed">
            {repair.diff.split('\n').map((line, i) => {
              let lineClass = 'diff-line-unchanged';
              if (line.startsWith('+')) lineClass = 'diff-line-added px-2 py-0.5 rounded-sm block my-0.5';
              else if (line.startsWith('-')) lineClass = 'diff-line-removed px-2 py-0.5 rounded-sm block my-0.5';
              return (
                <div key={i} className={lineClass}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
};
