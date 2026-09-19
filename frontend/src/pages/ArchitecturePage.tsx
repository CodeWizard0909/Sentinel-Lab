import React from 'react';
import { Cloud, Cpu, Box, Database, HardDrive, Shield, Server, ArrowRight, CheckCircle2, Lock, Terminal } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const awsServices = [
    {
      name: 'Amazon Bedrock',
      category: 'Foundation Models & Agent Reasoning',
      icon: Cpu,
      color: 'from-cyan-500 to-blue-600',
      description: 'Powers the 4 specialized AI agents: Code Analysis Agent, Security Vulnerability Agent, Neural Repair Agent, and the Verification Judge Agent.',
      models: ['anthropic.claude-3-5-sonnet-20241022-v2:0', 'anthropic.claude-3-haiku-20240307-v1:0'],
      keyFeatures: ['Structured JSON Schema Outputs', 'Deterministic Verification Prompting', 'Multi-turn Agent Collaboration']
    },
    {
      name: 'Amazon Bedrock AgentCore Sandbox',
      category: 'Isolated Code Execution Engine',
      icon: Box,
      color: 'from-purple-500 to-indigo-600',
      description: 'Provides ephemeral, network-isolated sandboxes with pre-installed language runtimes to execute exploit payloads and regression test suites safely.',
      models: ['AgentCore Code Interpreter MicroVM'],
      keyFeatures: ['Zero-Trust Network Isolation', 'Hardened Container Boundaries', 'Precise Resource & Memory Quotas']
    },
    {
      name: 'AWS Lambda',
      category: 'Serverless Execution Backend',
      icon: Server,
      color: 'from-amber-500 to-orange-600',
      description: 'Executes scan dispatchers, manages pipeline state transitions, and serves FastAPI backend via Mangum ASGI adapter.',
      models: ['Python 3.11 Runtime / ARM64 Graviton'],
      keyFeatures: ['Sub-second Cold Starts', 'EventBridge Async Triggering', 'Stateless Autoscaling']
    },
    {
      name: 'Amazon DynamoDB',
      category: 'Distributed NoSQL State Store',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      description: 'Single-table design tracking scan lifecycle, identified CVE issues, generated repair proposals, and signed judge verdicts.',
      models: ['Pay-Per-Request On-Demand'],
      keyFeatures: ['Sub-10ms Read/Write Latency', 'Point-In-Time Recovery', 'DynamoDB Streams for Realtime Updates']
    },
    {
      name: 'Amazon S3',
      category: 'Secure Artifact & Transcript Storage',
      icon: HardDrive,
      color: 'from-rose-500 to-pink-600',
      description: 'Stores encrypted source code bundles, generated unified patches (.patch), stdout/stderr sandbox logs, and audit certificates.',
      models: ['S3 Standard with SSE-KMS'],
      keyFeatures: ['KMS Customer-Managed Encryption', 'Lifecycle Policies for Ephemeral Dumps', 'Presigned URLs for Secure Uploads']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Cloud className="w-3.5 h-3.5" /> AWS Cloud Native Architecture
        </div>
        <h1 className="text-3xl md:text-4xl font-black font-['Outfit'] text-white">
          Architected for AWS Hackathon Excellence
        </h1>
        <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
          SentinelLab is deeply integrated into core AWS foundational services, leveraging Amazon Bedrock for multi-agent reasoning and Amazon Bedrock AgentCore for isolated sandbox code execution.
        </p>
      </div>

      {/* System Flow Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>End-to-End AWS Verification Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '1. Ingestion', desc: 'Code bundle upload to S3 + Scan record in DynamoDB', color: 'border-cyan-500/30 bg-cyan-950/20' },
            { step: '2. Analysis Agents', desc: 'Bedrock Claude 3.5 Sonnet parses AST & flags CVEs', color: 'border-blue-500/30 bg-blue-950/20' },
            { step: '3. Neural Repair', desc: 'Synthesizes targeted unified patch in Bedrock', color: 'border-purple-500/30 bg-purple-950/20' },
            { step: '4. AgentCore Sandbox', desc: 'Runs baseline vs patch in isolated AWS container', color: 'border-amber-500/30 bg-amber-950/20' },
            { step: '5. Judge Verdict', desc: 'Certifies patch & signs audit record to DynamoDB/S3', color: 'border-emerald-500/30 bg-emerald-950/20' },
          ].map((item, i) => (
            <div key={i} className={`p-3.5 rounded-xl border ${item.color} flex flex-col justify-between`}>
              <div className="font-bold text-xs text-white mb-1">{item.step}</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-dive AWS Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awsServices.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${svc.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 bg-slate-900 border border-white/10 rounded">
                    AWS Integrated
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{svc.name}</h3>
                  <div className="text-xs text-cyan-300/80 font-medium">{svc.category}</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Capabilities:</div>
                <ul className="space-y-1">
                  {svc.keyFeatures.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
