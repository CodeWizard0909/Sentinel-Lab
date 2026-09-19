import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Check, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import { SentinelApiService } from '../services/api';

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
  const scanId = searchParams.get('scanId') || 'SL-1024';

  const [isDone, setIsDone] = useState(false);
  const [terminalIndex, setTerminalIndex] = useState(0);

  const terminalLogs = [
    { text: '> Initializing isolated environment...', type: 'sys' },
    { text: '> Loading project files (17 files, 2.4 MB)...', type: 'sys' },
    { text: '> SQL injection detected in database.js:42', type: 'err' },
    { text: '> Generating secure parameterized query...', type: 'warn' },
    { text: '> Applying generated patch to database.js...', type: 'info' },
    { text: '> Running attack payload inside sandbox...', type: 'warn' },
    { text: '> Exploit blocked. Zero leak detected.', type: 'succ' },
    { text: '> Running regression tests across all suites...', type: 'info' },
    { text: '> 14/14 tests passed.', type: 'succ' },
    { text: '> Cryptographic verification verdict issued: VERIFIED.', type: 'succ' },
  ];

  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([
    {
      name: 'Code Analyzer',
      role: 'AST & CFG Parsing',
      status: 'done',
      timing: '0.6s',
      activity: 'Extracted 14 call sites & abstract syntax trees.'
    },
    {
      name: 'Security Agent',
      role: 'CWE-89 Heuristics',
      status: 'done',
      timing: '1.1s',
      activity: 'Flagged unsanitized concatenation in database.js:42.'
    },
    {
      name: 'Repair Agent',
      role: 'Neural Synthesis',
      status: 'active',
      timing: '1.4s',
      activity: 'Synthesizing parameterized DB-API replacement.'
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
      role: 'Differential Proof',
      status: 'pending',
      timing: 'Queued',
      activity: 'Waiting for exploit & regression execution delta.'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalIndex((prev) => {
        if (prev < terminalLogs.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  useEffect(() => {
    let isSubscribed = true;

    SentinelApiService.simulateScanProgress(scanId, (data) => {
      if (!isSubscribed) return;
      
      const s = data.status;
      setPipelineSteps((prev) => {
        const next = prev.map(p => ({...p})); // clone
        
        if (s === 'ANALYZING') {
          next[0].status = 'active';
          next[1].status = 'active';
        } else if (s === 'REPAIRING' || s === 'SANDBOXING' || s === 'JUDGING' || s === 'COMPLETED' || s === 'VERIFIED' || s === 'FAILED') {
          next[0].status = 'done';
          next[1].status = 'done';
          
          if (s === 'REPAIRING') {
            next[2].status = 'active';
          } else {
            next[2].status = 'done';
            
            if (s === 'SANDBOXING') {
              next[3].status = 'active';
            } else {
              next[3].status = 'done';
              
              if (s === 'JUDGING') {
                next[4].status = 'active';
              } else {
                next[4].status = 'done';
              }
            }
          }
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

  return (
    <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-28 pb-20 max-w-6xl mx-auto flex flex-col text-white">
      
      {/* Top Header */}
      <div className="neural-card p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3.5 py-1 rounded-full neural-pill text-[11px] font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              VERIFICATION IN PROGRESS
            </span>
            <span className="text-xs font-mono text-[#a2a9b8]">
              SCAN #{scanId.replace('scan-', 'SL-')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-white flex items-center gap-3 font-light">
            <span>student-portal.zip</span>
            <span className="text-xs font-mono text-[#a2a9b8] font-normal px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              AWS Bedrock Orchestrated
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isDone ? (
            <button
              onClick={() => navigate(`/results/${scanId}`)}
              className="w-full md:w-auto px-6 py-2.5 cta-glass text-white font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span className="weight-506">View Verification Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full md:w-auto flex items-center justify-center gap-3 px-5 py-2.5 neural-pill text-xs font-mono text-sky-300">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Agents Running in Sandbox...</span>
            </div>
          )}
        </div>
      </div>

      {/* Four-Agent Pipeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-mono text-[#a2a9b8] uppercase tracking-wider">
            FOUR-AGENT VERIFICATION PIPELINE
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {isDone ? 'Verification sequence completed' : 'Autonomous execution sequence'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {pipelineSteps.map((step, idx) => {
            const isDoneStep = step.status === 'done';
            const isActiveStep = step.status === 'active';

            return (
              <div
                key={idx}
                className={`neural-card p-4 transition-all flex flex-col justify-between ${
                  isActiveStep
                    ? 'border-sky-400/60 shadow-lg shadow-sky-500/15 scale-[1.02]'
                    : isDoneStep
                    ? 'border-emerald-500/30'
                    : 'opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500">{step.timing}</span>
                    {isDoneStep ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                        ✓
                      </span>
                    ) : isActiveStep ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white weight-531">
                    {step.name}
                  </h3>
                  <div className="text-[10px] font-mono text-[#a2a9b8] mt-0.5">{step.role}</div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/5 text-[11px] text-[#a2a9b8] leading-snug">
                  {step.activity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal & Code Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Sandbox Terminal */}
        <div className="lg:col-span-6 neural-card p-6 flex flex-col justify-between bg-[#02060f]/90">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono text-[#e2ebf5] uppercase tracking-wider font-semibold">
                  SANDBOX EXECUTION STREAM
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>EPHEMERAL MICROVM</span>
              </div>
            </div>

            <div className="font-mono text-xs space-y-2.5 min-h-[300px] overflow-y-auto">
              {terminalLogs.slice(0, terminalIndex).map((log, i) => (
                <div 
                  key={i}
                  className={`leading-relaxed animate-fade-up ${
                    log.type === 'err' ? 'text-red-400' :
                    log.type === 'warn' ? 'text-amber-400' :
                    log.type === 'succ' ? 'text-emerald-400 font-medium' :
                    log.type === 'info' ? 'text-sky-300' :
                    'text-[#a2a9b8]'
                  }`}
                >
                  {log.text}
                </div>
              ))}
              {terminalIndex < terminalLogs.length && (
                <div className="flex items-center gap-1 text-sky-400 text-xs font-mono pt-1">
                  <span className="inline-block w-1.5 h-3 bg-sky-400 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Container: c-bedrock-sandbox-9921</span>
            <span>Memory: 41.2 MB / 512 MB</span>
          </div>
        </div>

        {/* Code Diff Panel */}
        <div className="lg:col-span-6 neural-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#e2ebf5] uppercase tracking-wider font-semibold">
                  SYNTACTIC CODE REMEDIATION
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-mono border border-sky-500/30">
                  AI GENERATED PATCH
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isDone 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {isDone ? 'VERIFIED' : 'VERIFYING PATCH...'}
                </span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#02060f] border border-red-500/25">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">
                    BEFORE (database.js:42)
                  </span>
                  <span className="text-[10px] text-zinc-500">VULNERABLE QUERY</span>
                </div>
                <div className="diff-line-removed p-2 rounded text-red-200">
                  db.query("SELECT * FROM users WHERE id=" + id)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#02060f] border border-emerald-500/25">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                    AFTER (database.js:42)
                  </span>
                  <span className="text-[10px] text-zinc-500">PARAMETERIZED QUERY</span>
                </div>
                <div className="diff-line-added p-2 rounded text-emerald-200">
                  db.query("SELECT * FROM users WHERE id=?", [id])
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#a2a9b8] leading-relaxed font-sans">
                <strong className="text-zinc-200 font-medium">Patch Analysis:</strong> Dynamic SQL literal string concatenation replaced with prepared query placeholder binding, entirely mitigating CWE-89 injection risk.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs font-mono text-[#a2a9b8]">
              Audit ID: <span className="text-zinc-200">audit-sl-1024-db</span>
            </div>
            <button
              onClick={() => navigate(`/results/${scanId}`)}
              className="px-4 py-2 neural-pill text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <span>Inspect Full Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
