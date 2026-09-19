import React from 'react';
import { Cloud, Cpu, Box, Database, HardDrive, Shield, Server, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitecturePage: React.FC = () => {
  const awsServices = [
    {
      name: 'Amazon Bedrock',
      category: 'Foundation Models & Agent Reasoning',
      icon: Cpu,
      description: 'Powers the 4 specialized AI agents: Code Analysis Agent, Security Vulnerability Agent, Neural Repair Agent, and the Verification Judge Agent.',
      models: ['anthropic.claude-3-5-sonnet-20241022-v2:0', 'anthropic.claude-3-haiku-20240307-v1:0'],
      keyFeatures: ['Structured JSON Schema Outputs', 'Deterministic Verification Prompting', 'Multi-turn Agent Collaboration']
    },
    {
      name: 'Amazon Bedrock AgentCore Sandbox',
      category: 'Isolated Code Execution Engine',
      icon: Box,
      description: 'Provides ephemeral, network-isolated sandboxes with pre-installed language runtimes to execute exploit payloads and regression test suites safely.',
      models: ['AgentCore Code Interpreter MicroVM'],
      keyFeatures: ['Zero-Trust Network Isolation', 'Hardened Container Boundaries', 'Precise Resource & Memory Quotas']
    },
    {
      name: 'AWS Lambda',
      category: 'Serverless Execution Backend',
      icon: Server,
      description: 'Executes scan dispatchers, manages pipeline state transitions, and serves FastAPI backend via Mangum ASGI adapter.',
      models: ['Python 3.11 Runtime / ARM64 Graviton'],
      keyFeatures: ['Sub-second Cold Starts', 'EventBridge Async Triggering', 'Stateless Autoscaling']
    },
    {
      name: 'Amazon DynamoDB',
      category: 'Distributed NoSQL State Store',
      icon: Database,
      description: 'Single-table design tracking scan lifecycle, identified CVE issues, generated repair proposals, and signed judge verdicts.',
      models: ['Pay-Per-Request On-Demand'],
      keyFeatures: ['Sub-10ms Read/Write Latency', 'Point-In-Time Recovery', 'DynamoDB Streams for Realtime Updates']
    },
    {
      name: 'Amazon S3',
      category: 'Secure Artifact & Transcript Storage',
      icon: HardDrive,
      description: 'Stores encrypted source code bundles, generated unified patches (.patch), stdout/stderr sandbox logs, and audit certificates.',
      models: ['S3 Standard with SSE-KMS'],
      keyFeatures: ['KMS Customer-Managed Encryption', 'Lifecycle Policies for Ephemeral Dumps', 'Presigned URLs for Secure Uploads']
    }
  ];

  return (
    <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-28 pb-20 max-w-6xl mx-auto flex flex-col text-white">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[11px] font-mono tracking-widest text-sky-400 border border-sky-500/30 uppercase mb-4">
          <Cloud className="w-3.5 h-3.5" />
          <span>AWS CLOUD NATIVE ARCHITECTURE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-tight">
          Architected for AWS Excellence
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3 font-normal leading-relaxed">
          SentinelLab is deeply integrated into core AWS foundational services, leveraging Amazon Bedrock for multi-agent reasoning and Amazon Bedrock AgentCore for isolated sandbox code execution.
        </p>
      </div>

      {/* System Flow Diagram */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-12">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold uppercase">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>End-to-End AWS Verification Pipeline</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Deterministic Feedback Loop</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '1. Ingestion', desc: 'Code bundle upload to S3 + Scan record in DynamoDB' },
            { step: '2. Analysis Agents', desc: 'Bedrock Claude 3.5 Sonnet parses AST & flags CVEs' },
            { step: '3. Neural Repair', desc: 'Synthesizes targeted unified patch in Bedrock' },
            { step: '4. AgentCore Sandbox', desc: 'Runs baseline vs patch in isolated AWS container' },
            { step: '5. Judge Verdict', desc: 'Certifies patch & signs audit record to DynamoDB/S3' },
          ].map((item, i) => (
            <div key={i} className="liquid-glass-card p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="font-semibold text-xs text-white mb-1.5 font-mono">{item.step}</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-dive AWS Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awsServices.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div key={i} className="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sky-400">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 liquid-glass-pill rounded border border-white/10">
                    AWS Native
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white">{svc.name}</h3>
                <div className="text-xs font-mono text-sky-400/90 mt-0.5">{svc.category}</div>

                <p className="text-xs text-zinc-400 leading-relaxed mt-3">
                  {svc.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Key Capabilities:</div>
                <ul className="space-y-1.5">
                  {svc.keyFeatures.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-xs text-zinc-300">
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

      {/* Back to Workspace Footer CTA */}
      <div className="mt-14 text-center">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wide uppercase hover:bg-zinc-200 transition-all shadow-xl"
        >
          <span>Launch Verification on AWS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
