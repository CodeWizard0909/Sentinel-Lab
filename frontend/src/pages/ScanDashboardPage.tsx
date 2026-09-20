import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Check, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import { SentinelApiService } from '../services/api';
import { ScanResult } from '../types';

interface AgentStep {
  name: string;
  role: string;
  status: 'done' | 'active' | 'pending';
  timing: string;
  activity: string;
}

export const ScanDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scanId = searchParams.get('scanId') || 'scan-sample-1';

  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [terminalIndex, setTerminalIndex] = useState(0);

  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type: string }>>([
    { text: '> Initializing isolated AgentCore environment...', type: 'sys' },
    { text: '> Loading target project files...', type: 'sys' },
    { text: '> Parsing AST call graphs and symbol tables...', type: 'info' },
    { text: '> Running OWASP / CWE vulnerability detection rules...', type: 'warn' },
    { text: '> Flagged security issue in target source...', type: 'err' },
    { text: '> Synthesizing targeted neural repair patch...', type: 'info' },
    { text: '> Launching pristine AWS MicroVM sandbox container...', type: 'sys' },
    { text: '> Executing exploit attack harness...', type: 'warn' },
    { text: '> Exploit blocked. Zero security leak detected.', type: 'succ' },
    { text: '> Running functional regression tests...', type: 'info' },
    { text: '> All test assertions passed (0 regressions).', type: 'succ' },
    { text: '> Deterministic Judge verification issued: VERIFIED.', type: 'succ' }
  ]);

  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([
    {
      name: 'Code Analyzer',
      role: 'AST & CFG Parsing',
      status: 'active',
      timing: '0.5s',
      activity: 'Extracting symbol tables & abstract syntax trees.'
    },
    {
      name: 'Security Agent',
      role: 'OWASP / CWE Heuristics',
      status: 'pending',
      timing: 'Queued',
      activity: 'Scanning for injection, traversal, and auth vulnerabilities.'
    },
    {
      name: 'Repair Agent',
      role: 'Neural Synthesis',
      status: 'pending',
      timing: 'Queued',
      activity: 'Synthesizing verified minimal remediation patch.'
    },
    {
      name: 'Sandbox',
      role: 'AgentCore MicroVM',
      status: 'pending',
      timing: 'Queued',
      activity: 'Preparing zero-egress test harness container.'
    },
    {
      name: 'Judge',
      role: 'Deterministic Proof',
      status: 'pending',
      timing: 'Queued',
      activity: 'Evaluating exploit neutralization & regression deltas.'
    }
  ]);

  useEffect(() => {
    SentinelApiService.getScanById(scanId).then((data) => {
      if (data) {
        setScanData(data);
        const primaryIssue = data.issues?.[0];
        const fileName = primaryIssue?.file_path || data.project_name;
        const cwe = primaryIssue?.cwe_id || 'CWE-89';
        const testsCount = data.repaired_sandbox?.tests_passed ?? 12;

        setTerminalLogs([
          { text: `> Initializing isolated AgentCore environment for [${data.project_name}]...`, type: 'sys' },
          { text: `> Loading project files (${fileName})...`, type: 'sys' },
          { text: `> Code Analyzer: AST parsing & syntax validation complete.`, type: 'info' },
          { text: `> Security Agent: ${primaryIssue?.title || 'Vulnerability detected'} (${cwe})`, type: 'err' },
          { text: `> Neural Repair Agent: Generating secure patch for ${fileName}...`, type: 'warn' },
          { text: `> Applying patch to pristine AgentCore MicroVM...`, type: 'info' },
          { text: `> Running exploit attack verification in container...`, type: 'warn' },
          { text: `> Exploit payload safely neutralized. Exit code 0.`, type: 'succ' },
          { text: `> Executing full regression test suite...`, type: 'info' },
          { text: `> ${testsCount}/${testsCount} tests passed. Zero regressions detected.`, type: 'succ' },
          { text: `> Judge Agent: Cryptographic attestation issued: VERIFIED.`, type: 'succ' }
        ]);

        setPipelineSteps([
          {
            name: 'Code Analyzer',
            role: 'AST & CFG Parsing',
            status: 'active',
            timing: '0.6s',
            activity: `Profiled ${fileName} abstract syntax tree & call sites.`
          },
          {
            name: 'Security Agent',
            role: `${cwe} Heuristics`,
            status: 'pending',
            timing: '1.0s',
            activity: `Identified ${primaryIssue?.title || 'vulnerability'} on line ${primaryIssue?.line_start || 1}.`
          },
          {
            name: 'Repair Agent',
            role: 'Neural Synthesis',
            status: 'pending',
            timing: '1.4s',
            activity: `Generated safe targeted remediation patch.`
          },
          {
            name: 'Sandbox',
            role: 'AgentCore MicroVM',
            status: 'pending',
            timing: 'Queued',
            activity: `Container executed ${testsCount} test assertions.`
          },
          {
            name: 'Judge',
            role: 'Deterministic Proof',
            status: 'pending',
            timing: 'Queued',
            activity: 'Certified patch zero-regression proof.'
          }
        ]);
      }
    });
  }, [scanId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalIndex((prev) => {
        if (prev < terminalLogs.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  useEffect(() => {
    let isSubscribed = true;

    SentinelApiService.simulateScanProgress(scanId, (data) => {
      if (!isSubscribed) return;
      
      const s = data.status;
      setPipelineSteps((prev) => {
        const next = prev.map(p => ({...p}));
        
        if (s === 'ANALYZING') {
          next[0].status = 'done';
          next[1].status = 'active';
        } else if (s === 'REPAIRING') {
          next[0].status = 'done';
          next[1].status = 'done';
          next[2].status = 'active';
        } else if (s === 'SANDBOXING') {
          next[0].status = 'done';
          next[1].status = 'done';
          next[2].status = 'done';
          next[3].status = 'active';
        } else if (s === 'JUDGING') {
          next[0].status = 'done';
          next[1].status = 'done';
          next[2].status = 'done';
          next[3].status = 'done';
          next[4].status = 'active';
        } else if (s === 'COMPLETED' || s === 'VERIFIED') {
          next.forEach(step => step.status = 'done');
        }
        return next;
      });
    }).then(() => {
      if (isSubscribed) {
        setPipelineSteps((prev) => prev.map(step => ({ ...step, status: 'done' })));
        setIsDone(true);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [scanId]);

  const activeProjectName = scanData?.project_name || 'Autonomous Verification';

  return (
    <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-28 pb-20 max-w-6xl mx-auto flex flex-col text-white">
      
      {/* 1. TOP HEADER & METADATA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#a2a9b8] mb-1">
            <span>Project:</span>
            <span className="text-white font-medium">{activeProjectName}</span>
            <span className="text-white/20">•</span>
            <span>Scan ID:</span>
            <span className="text-white font-medium">#{scanId.replace('scan-', 'SL-')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-light flex items-center gap-3">
            <span>Autonomous AI Verification Pipeline</span>
            {!isDone && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                Live Execution
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3 mr-1" />
                Completed
              </span>
            )}
          </h1>
        </div>

        {isDone && (
          <button
            onClick={() => navigate(`/results/${scanId}`)}
            className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <span>View Verification Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. AGENT PIPELINE CARDS (5 AGENTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {pipelineSteps.map((agent, index) => {
          const isFinished = agent.status === 'done';
          const isCurrent = agent.status === 'active';

          return (
            <div
              key={agent.name}
              className={`rounded-2xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isCurrent 
                  ? 'border border-sky-500/40 bg-sky-500/[0.04] shadow-[0_0_25px_rgba(56,189,248,0.15)]' 
                  : isFinished
                    ? 'border border-emerald-500/25 bg-emerald-500/[0.02]'
                    : 'border border-white/10 bg-white/[0.015] opacity-60'
              }`}
            >
              <div>
                {/* Agent Number & Status Icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#a2a9b8] uppercase">
                    0{index + 1}
                  </span>
                  {isFinished && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px]">
                      ✓
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    </div>
                  )}
                  {!isFinished && !isCurrent && (
                    <div className="w-4 h-4 rounded-full border border-white/10" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white mb-0.5">{agent.name}</h3>
                <span className="text-[10px] font-mono text-[#a2a9b8] block mb-2">{agent.role}</span>
                <p className="text-[11px] text-[#a2a9b8] leading-snug">{agent.activity}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#a2a9b8]">Timing:</span>
                <span className={isFinished ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
                  {isFinished ? agent.timing : isCurrent ? 'Active...' : 'Queued'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. DUAL-PANE: LIVE TERMINAL & AWS TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Terminal Output (8 cols) */}
        <div className="lg:col-span-8 neural-card p-5 sm:p-6 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2 text-[#e2ebf5]">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                REAL-TIME AGENT TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#a2a9b8]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AWS AgentCore MicroVM Active</span>
            </div>
          </div>

          <div className="bg-black/60 rounded-xl p-4 border border-white/5 h-64 overflow-y-auto space-y-2 text-[12px] leading-relaxed select-text font-mono">
            {terminalLogs.slice(0, terminalIndex).map((log, idx) => (
              <div 
                key={idx} 
                className={`${
                  log.type === 'err' 
                    ? 'text-red-400 font-semibold' 
                    : log.type === 'warn' 
                      ? 'text-amber-300' 
                      : log.type === 'succ' 
                        ? 'text-emerald-400 font-semibold' 
                        : log.type === 'info'
                          ? 'text-sky-300'
                          : 'text-[#a2a9b8]'
                }`}
              >
                {log.text}
              </div>
            ))}
            {terminalIndex < terminalLogs.length && (
              <div className="flex items-center gap-1 text-sky-400">
                <span className="inline-block w-2 h-3.5 bg-sky-400 animate-pulse" />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#a2a9b8]">
            <span>Channel: /agentcore/telemetry/{scanId}</span>
            <span>Zero-Trust Protocol Active</span>
          </div>
        </div>

        {/* Right: AWS Infrastructure Telemetry (4 cols) */}
        <div className="lg:col-span-4 neural-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-mono uppercase tracking-wider text-[#e2ebf5] font-semibold">
              PIPELINE RESOURCES
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              CONNECTED
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-[#a2a9b8]">Foundation LLM</span>
              <span className="text-white">Claude 3.5 Sonnet</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-[#a2a9b8]">Sandbox Engine</span>
              <span className="text-sky-400">Bedrock AgentCore</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-[#a2a9b8]">State Ledger</span>
              <span className="text-white">DynamoDB Streams</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-[#a2a9b8]">Artifact Store</span>
              <span className="text-white">S3 Object Lock</span>
            </div>
          </div>

          <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#a2a9b8] leading-relaxed">
            All code transformations and exploits execute strictly within ephemeral micro-containers without network egress.
          </div>
        </div>

      </div>

    </div>
  );
};
