import React from 'react';
import { Issue } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ChevronRight, FileCode } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, isSelected, onSelect }) => {
  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'CRITICAL':
        return 'badge-rose';
      case 'HIGH':
        return 'badge-amber';
      case 'MEDIUM':
        return 'badge-cyan';
      case 'LOW':
      default:
        return 'badge-purple';
    }
  };

  const getCategoryIcon = () => {
    switch (issue.category) {
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'LOGIC_BUG':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900/90'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <span className="text-xs font-bold text-slate-100">{issue.title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {issue.cwe_id && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-300 border border-white/10 rounded">
              {issue.cwe_id}
            </span>
          )}
          <span className={`badge ${getSeverityBadge()} text-[10px]`}>
            {issue.severity}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        {issue.description}
      </p>

      {issue.code_snippet && (
        <div className="mb-3 p-2 bg-black/60 rounded-lg border border-white/5 font-mono text-[11px] text-rose-300/90 overflow-x-auto">
          <code>{issue.code_snippet}</code>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-mono">
          <FileCode className="w-3.5 h-3.5 text-slate-500" />
          <span>{issue.file_path}:{issue.line_start}</span>
        </div>
        {issue.recommendation && (
          <span className="text-cyan-400/90 text-[11px] truncate max-w-[200px]">
            {issue.recommendation}
          </span>
        )}
      </div>
    </div>
  );
};
