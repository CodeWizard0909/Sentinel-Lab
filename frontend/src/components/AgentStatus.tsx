import React from 'react';
import { ScanStatus } from '../types';
import { Search, ShieldAlert, Wrench, Box, Scale, CheckCircle2, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface AgentStatusProps {
  status: ScanStatus;
  currentStep?: string;
}

interface StepConfig {
  key: string;
  name: string;
  role: string;
  icon: React.ElementType;
  description: string;
  awsService: string;
}

const STEPS: StepConfig[] = [
  {
    key: 'ANALYZING',
    name: 'Code Analysis Agent',
    role: 'AST & Quality Profiler',
    icon: Search,
    description: 'Inspects syntax, structural anomalies, dependencies, and code hygiene.',
    awsService: 'Bedrock Claude 3.5 Sonnet'
  },
  {
    key: 'SECURITY_SCAN',
    name: 'Security Vulnerability Agent',
    role: 'OWASP & CVE Detector',
    icon: ShieldAlert,
    description: 'Searches for SQLi, XSS, SSRF, broken auth, and exposed secrets.',
    awsService: 'Bedrock Claude 3.5 Sonnet'
  },
  {
    key: 'REPAIRING',
    name: 'Neural Repair Agent',
    role: 'Autonomous Patch Generator',
    icon: Wrench,
    description: 'Generates targeted minimal unified diffs and non-breaking fixes.',
    awsService: 'Bedrock Claude 3.5 Sonnet'
  },
  {
    key: 'SANDBOX_EXECUTION',
    name: 'AWS Isolated Sandbox',
    role: 'Runtime & Exploit Validation',
    icon: Box,
    description: 'Executes original vs repaired code in isolated Bedrock AgentCore container.',
    awsService: 'Bedrock AgentCore Sandbox'
  },
  {
    key: 'JUDGING',
    name: 'Verification Judge Agent',
    role: 'Safety & Regression Certifier',
    icon: Scale,
    description: 'Evaluates sandbox exit codes, regression deltas, and certifies the patch.',
    awsService: 'Bedrock Claude 3.5 Sonnet'
  }
];

export const AgentStatus: React.FC<AgentStatusProps> = ({ status }) => {
  const getStepState = (stepIndex: number) => {
    const statusOrder: ScanStatus[] = [
      'QUEUED',
      'ANALYZING',
      'SECURITY_SCAN',
      'REPAIRING',
      'SANDBOX_EXECUTION',
      'JUDGING',
      'COMPLETED'
    ];

    const currentIndex = statusOrder.indexOf(status);
    const stepTargetIndex = stepIndex + 1; // map to statusOrder

    if (status === 'FAILED') return 'failed';
    if (status === 'COMPLETED' || currentIndex > stepTargetIndex) return 'completed';
    if (currentIndex === stepTargetIndex) return 'running';
    return 'pending';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Multi-Agent Orchestration Flow</span>
            {status !== 'COMPLETED' && status !== 'FAILED' && (
              <span className="flex items-center gap-1 text-xs text-cyan-400 font-mono font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> In Progress
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">Autonomous AWS Bedrock agents operating in verification sequence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          let cardStyle = 'bg-slate-900/40 border-white/5 text-slate-500';
          let iconBadgeStyle = 'bg-slate-800 text-slate-500';

          if (state === 'running') {
            cardStyle = 'bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/10 text-slate-200 ring-1 ring-cyan-400/30';
            iconBadgeStyle = 'bg-cyan-500 text-slate-950 animate-bounce';
          } else if (state === 'completed') {
            cardStyle = 'bg-slate-900/80 border-emerald-500/30 text-slate-200';
            iconBadgeStyle = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
          } else if (state === 'failed') {
            cardStyle = 'bg-rose-950/20 border-rose-500/40 text-slate-300';
            iconBadgeStyle = 'bg-rose-500/20 text-rose-400';
          }

          return (
            <div
              key={step.key}
              className={`relative flex flex-col justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${cardStyle}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${iconBadgeStyle}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-mono font-semibold tracking-wider uppercase">
                    {state === 'completed' && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                    {state === 'running' && (
                      <span className="flex items-center gap-1 text-cyan-400 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Active
                      </span>
                    )}
                    {state === 'pending' && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" /> Queued
                      </span>
                    )}
                    {state === 'failed' && (
                      <span className="flex items-center gap-1 text-rose-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-100 mb-0.5">{step.name}</div>
                <div className="text-[11px] text-cyan-400/90 font-medium mb-2">{step.role}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span>Engine</span>
                <span className="font-mono text-cyan-300/80 font-medium">{step.awsService}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
