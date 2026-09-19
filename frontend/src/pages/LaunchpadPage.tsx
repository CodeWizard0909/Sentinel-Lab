import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_PROJECTS } from '../mock/mockData';
import { SentinelApiService } from '../services/api';
import { Shield, Sparkles, Play, Code2, Cpu, Box, Terminal, FileCheck, Layers, ArrowRight } from 'lucide-react';

export const LaunchpadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSample, setSelectedSample] = useState(SAMPLE_PROJECTS[0]);
  const [projectName, setProjectName] = useState(SAMPLE_PROJECTS[0].name);
  const [code, setCode] = useState(SAMPLE_PROJECTS[0].code);
  const [testCode, setTestCode] = useState(SAMPLE_PROJECTS[0].testCode);
  const [selectedModel, setSelectedModel] = useState('anthropic.claude-3-5-sonnet-20241022-v2:0');
  const [sandboxProvider, setSandboxProvider] = useState('BEDROCK_AGENTCORE');
  const [isLaunching, setIsLaunching] = useState(false);

  const handleSelectSample = (sample: typeof SAMPLE_PROJECTS[0]) => {
    setSelectedSample(sample);
    setProjectName(sample.name);
    setCode(sample.code);
    setTestCode(sample.testCode);
  };

  const handleLaunchVerification = async () => {
    setIsLaunching(true);
    const { scan_id } = await SentinelApiService.initiateScan({
      projectName,
      code,
      testCode,
      model: selectedModel,
      sandboxProvider,
    });
    setIsLaunching(false);
    navigate(`/dashboard?scanId=${scan_id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-panel border border-cyan-500/20 bg-gradient-to-br from-[#0a1224] via-[#090d18] to-[#120a21]">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Isolated Sandbox Code Verification
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-['Outfit'] text-white tracking-tight leading-tight">
            AI-generated fixes should <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">not be trusted</span> until tested in a sandbox.
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            SentinelLab orchestrates 5 autonomous AWS Bedrock agents to analyze code, discover vulnerabilities, formulate targeted repairs, and verify execution inside isolated Bedrock AgentCore sandboxes.
          </p>
        </div>
      </div>

      {/* Preset Benchmarks & Custom Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Select a Vulnerability Benchmark or Write Custom Code</span>
          </h2>
          <span className="text-xs text-slate-400">Pre-configured CVE exploit test suites</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_PROJECTS.map((sample) => {
            const isSelected = selectedSample.id === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/50 to-slate-900 border-cyan-400/60 shadow-lg shadow-cyan-500/15'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-cyan text-[10px]">{sample.category}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">{sample.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sample.description}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 text-[11px] text-cyan-400 font-medium flex items-center justify-between">
                  <span>Load Benchmark</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Editor & Config Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Input (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col">
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-400 w-72"
                placeholder="Project Name / File Target"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">Python 3.11</span>
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col bg-[#070b14]">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Target Source Code (Under Inspection):
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full bg-[#050810] border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400/80 leading-relaxed resize-none shadow-inner"
                placeholder="Paste Python source code here..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Sandbox Regression Test Suite (Optional):
              </label>
              <textarea
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                rows={5}
                className="w-full bg-[#050810] border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-200/90 focus:outline-none focus:border-cyan-400/80 leading-relaxed resize-none shadow-inner"
                placeholder="assert functions to execute in sandbox..."
              />
            </div>
          </div>
        </div>

        {/* AWS Execution Configuration (1 col) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AWS Bedrock Agent Settings</span>
              </h3>
              <p className="text-xs text-slate-400">Configure foundational model reasoning parameters</p>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Foundational Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet v2 (Recommended)</option>
                <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku (Ultra-Fast)</option>
                <option value="amazon.titan-text-premier-v1:0">Amazon Titan Text Premier</option>
              </select>
            </div>

            {/* Sandbox Isolation Engine */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Isolated Sandbox Engine:</label>
              <select
                value={sandboxProvider}
                onChange={(e) => setSandboxProvider(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="BEDROCK_AGENTCORE">Amazon Bedrock AgentCore Code Interpreter</option>
                <option value="AWS_LAMBDA_SANDBOX">AWS Lambda Ephemeral MicroVM</option>
                <option value="LOCAL_CONTAINER">Mock / Local Docker Engine</option>
              </select>
            </div>

            {/* Pipeline Stage Highlights */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Multi-Agent Workflow:</div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>1. AST Analysis & Vulnerability Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>2. Autonomous Repair Synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>3. Isolated Bedrock Sandbox Run</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>4. Judge Agent Soundness Certification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunchVerification}
            disabled={isLaunching || !code.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isLaunching ? 'Dispatching to AWS...' : 'Verify in AWS Isolated Sandbox'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
