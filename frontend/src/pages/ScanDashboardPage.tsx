import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SentinelApiService } from '../services/api';
import { ScanResult } from '../types';
import { AgentStatus } from '../components/AgentStatus';
import { Terminal, Shield, ArrowRight, Loader2, CheckCircle2, Box, Cpu, Sparkles } from 'lucide-react';

export const ScanDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scanId = searchParams.get('scanId') || 'scan-sample-1';

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Initiating verification pipeline for Scan ID: ${scanId}`);
    addLog('Connecting to Amazon Bedrock runtime and AgentCore isolated environment...');

    SentinelApiService.simulateScanProgress(scanId, (updatedScan) => {
      if (!isMounted) return;
      setScan(updatedScan);

      if (updatedScan.status === 'ANALYZING') {
        addLog('[Code Analysis Agent] Parsing Abstract Syntax Tree and symbol resolution...');
      } else if (updatedScan.status === 'SECURITY_SCAN') {
        addLog('[Security Agent] Running CWE-89 / OWASP Top 10 vulnerability heuristics...');
        addLog(`[Vulnerability Flagged] Found ${updatedScan.issues.length} potential attack vector(s).`);
      } else if (updatedScan.status === 'REPAIRING') {
        addLog('[Neural Repair Agent] Formulating minimal regression-free patch...');
        addLog('[Patch Synthesized] Unified diff generated for target files.');
      } else if (updatedScan.status === 'SANDBOX_EXECUTION') {
        addLog('[AWS Sandbox] Provisioning isolated Amazon Bedrock AgentCore container...');
        addLog('[Sandbox Execution] Executing baseline vs repaired test harness...');
      } else if (updatedScan.status === 'JUDGING') {
        addLog('[Judge Agent] Evaluating sandbox exit codes, regression deltas, and proof of fix...');
      } else if (updatedScan.status === 'COMPLETED') {
        addLog('[Verification Complete] Judge Agent has certified the software patch.');
        setIsDone(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [scanId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-xs">Scan ID: {scanId}</span>
            <span className="text-xs text-slate-400 font-mono">
              Started: {scan?.created_at ? new Date(scan.created_at).toLocaleTimeString() : 'Now'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] text-white">
            {scan?.project_name || 'Autonomous Verification Pipeline'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isDone ? (
            <button
              onClick={() => navigate(`/results/${scanId}`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>View Verification Audit & Diff</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-4 py-2 rounded-xl border border-cyan-500/30">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Agents Running in Sandbox...</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Agent Visualizer */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <AgentStatus status={scan?.status || 'ANALYZING'} />
      </div>

      {/* Live Terminal Logs & AWS Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Logs (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col bg-[#060912]">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Live Multi-Agent Stream & Sandbox Console</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> streaming
            </span>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 h-72 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log.includes('Judge') || log.includes('Certified') ? (
                  <span className="text-emerald-400 font-semibold">{log}</span>
                ) : log.includes('Vulnerability') || log.includes('Flagged') ? (
                  <span className="text-rose-400 font-semibold">{log}</span>
                ) : log.includes('Sandbox') ? (
                  <span className="text-cyan-300">{log}</span>
                ) : (
                  <span className="text-slate-300">{log}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AWS Resource Traces (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> AWS Infrastructure Footprint
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400">Bedrock Model:</span>
                <span className="text-cyan-300 font-semibold truncate">
                  {scan?.aws_resources?.bedrock_model || 'Claude 3.5 Sonnet v2'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400">AgentCore Session ID:</span>
                <span className="text-slate-200 truncate">
                  {scan?.aws_resources?.agentcore_session_id || 'agentcore-sess-live'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400">S3 Audit Artifact:</span>
                <span className="text-slate-200 truncate">
                  {scan?.aws_resources?.s3_artifact_uri || 's3://sentinellab-artifacts/scan.zip'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400">DynamoDB State Table:</span>
                <span className="text-slate-200 truncate">sentinellab-scans-prod</span>
              </div>
            </div>
          </div>

          {isDone && (
            <button
              onClick={() => navigate(`/results/${scanId}`)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Inspect Full Audit Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
