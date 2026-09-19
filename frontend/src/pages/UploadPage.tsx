import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  Check
} from 'lucide-react';
import { SentinelApiService } from '../services/api';
import { SAMPLE_PROJECTS } from '../mock/mockData';

interface DemoProject {
  id: string;
  name: string;
  filename: string;
  size: string;
  fileCount: number;
  vulnType: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended?: boolean;
  description: string;
  code: string;
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'demo-sql',
    name: 'SQL Injection',
    filename: 'student-portal.zip',
    size: '2.4 MB',
    fileCount: 17,
    vulnType: 'SQL Injection (CWE-89)',
    severity: 'HIGH',
    recommended: true,
    description: 'Direct string concatenation in user login query allowing administrative authentication bypass.',
    code: SAMPLE_PROJECTS[0]?.code || 'db.query("SELECT * FROM users WHERE id=" + id)'
  },
  {
    id: 'demo-xss',
    name: 'XSS Vulnerability',
    filename: 'chat-service.zip',
    size: '1.8 MB',
    fileCount: 12,
    vulnType: 'Stored Cross-Site Scripting (CWE-79)',
    severity: 'HIGH',
    recommended: false,
    description: 'Unescaped user input rendered directly into DOM allows arbitrary script execution in client context.',
    code: `function renderMessage(userMessage) {\n  // VULNERABLE: Direct innerHTML injection\n  document.getElementById('messages').innerHTML += '<div class="msg">' + userMessage + '</div>';\n}`
  },
  {
    id: 'demo-logic',
    name: 'Logic Bug',
    filename: 'billing-engine.zip',
    size: '3.1 MB',
    fileCount: 22,
    vulnType: 'Off-by-One Token Exhaustion (CWE-193)',
    severity: 'MEDIUM',
    recommended: false,
    description: 'Sliding window rate limiter incorrectly decrements counter before window expiry, leading to premature lockouts.',
    code: SAMPLE_PROJECTS[1]?.code || 'if len(self.requests) > self.limit: return False'
  }
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedProject, setSelectedProject] = useState<DemoProject>(DEMO_PROJECTS[0]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedProject({
        id: 'custom-file',
        name: file.name.split('.')[0] || 'Custom Project',
        filename: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileCount: 14,
        vulnType: 'Custom Source Code',
        severity: 'HIGH',
        description: 'Uploaded source bundle ready for automated Bedrock AST parsing.',
        code: '// Uploaded project archive'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedProject({
        id: 'custom-file',
        name: file.name.split('.')[0] || 'Custom Project',
        filename: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileCount: 14,
        vulnType: 'Custom Source Code',
        severity: 'HIGH',
        description: 'Uploaded source bundle ready for automated Bedrock AST parsing.',
        code: '// Uploaded project archive'
      });
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await SentinelApiService.initiateScan({
      projectName: selectedProject.filename,
      code: selectedProject.code,
      model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      sandboxProvider: 'BEDROCK_AGENTCORE'
    });
    setIsAnalyzing(false);
    navigate(`/dashboard?scanId=${result.scan_id}`);
  };

  return (
    <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-28 pb-20 max-w-6xl mx-auto flex flex-col text-white">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-tight font-light">
          Start a verification
        </h1>
        <p className="text-sm sm:text-base text-[#a2a9b8] mt-3 font-normal weight-446">
          Upload your project and let SentinelLab investigate it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Upload / Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Glass Upload Card */}
          <div className="neural-card p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#e2ebf5]">
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <span className="tracking-wider uppercase font-semibold">UPLOAD YOUR PROJECT</span>
              </div>
              <span className="text-[11px] font-mono text-[#a2a9b8]">
                Drop a project archive or source file here.
              </span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed transition-all p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer text-center ${
                isDragging 
                  ? 'border-sky-400 bg-sky-500/10 scale-[1.01]' 
                  : 'border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".zip,.tar,.gz,.js,.ts,.py,.java"
                onChange={handleFileChange}
              />

              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-zinc-300 shadow-inner">
                <UploadCloud className="w-7 h-7 stroke-[1.8] text-zinc-200" />
              </div>

              <div className="text-base font-medium text-white mb-1 weight-531">
                Drop project here
              </div>
              <div className="text-xs text-[#a2a9b8] mb-4">or</div>

              <button
                type="button"
                className="px-5 py-2 neural-pill text-xs font-medium text-white shadow-sm"
              >
                Browse Files
              </button>

              <div className="text-[11px] font-mono text-zinc-500 mt-6 tracking-wide">
                Supported: ZIP · JS · TS · PY · JAVA
              </div>
            </div>

            {/* Ready State */}
            {selectedProject && (
              <div className="mt-6 pt-6 border-t border-white/10 neural-card p-5 border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-400">
                        ✓ PROJECT READY
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs font-mono text-[#e2ebf5]">
                        {selectedProject.size} · {selectedProject.fileCount} files
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5 weight-531">
                      {selectedProject.filename}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 neural-pill text-xs text-[#a2a9b8] hover:text-white"
                  >
                    Change Project
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                    className="flex-1 sm:flex-initial px-6 py-2 cta-glass text-xs font-semibold text-white flex items-center justify-center gap-2"
                  >
                    <span className="weight-506">{isAnalyzing ? 'Starting Pipeline...' : 'Start AI Analysis'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Controlled Demo Project Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-mono text-[#a2a9b8] uppercase tracking-wider">
                CONTROLLED BENCHMARK PROJECTS
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Click to load preconfigured exploit harness
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_PROJECTS.map((demo) => {
                const isSelected = selectedProject.id === demo.id;
                return (
                  <div
                    key={demo.id}
                    onClick={() => setSelectedProject(demo)}
                    className={`neural-card p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-400/60 shadow-lg shadow-sky-500/15 scale-[1.01]'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          demo.severity === 'HIGH' 
                            ? 'bg-red-500/10 text-red-300 border-red-500/30' 
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {demo.severity}
                        </span>

                        {demo.recommended && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                            Recommended
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-white weight-531">{demo.name}</h3>
                      <p className="text-[11px] text-[#a2a9b8] mt-1 line-clamp-2 leading-relaxed">
                        {demo.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-sky-400">
                      <span>Load Example</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar: AWS Infrastructure Status Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="neural-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#e2ebf5] font-semibold">
                AWS INFRASTRUCTURE
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>OPERATIONAL</span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Amazon Bedrock</span>
                </div>
                <span className="text-[10px] text-zinc-500">Claude 3.5</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lambda</span>
                </div>
                <span className="text-[10px] text-zinc-500">Node / Py runtime</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>S3</span>
                </div>
                <span className="text-[10px] text-zinc-500">Artifact Store</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sandbox</span>
                </div>
                <span className="text-[10px] text-sky-400">AgentCore MicroVM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DynamoDB</span>
                </div>
                <span className="text-[10px] text-zinc-500">State Ledger</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-[#a2a9b8] leading-relaxed">
              Every verification launches a sealed, zero-egress AWS micro-container. Malicious payloads cannot escape sandbox bounds.
            </div>
          </div>

          <div className="neural-card p-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#a2a9b8] font-semibold block mb-3">
              ZERO-TRUST GUARANTEE
            </span>
            <ul className="space-y-2 text-xs text-[#a2a9b8]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">01</span>
                <span>Exploit reproduces prior to patch synthesis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">02</span>
                <span>AI repair applied inside pristine container.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">03</span>
                <span>14+ regression suites must achieve 100% pass rate.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
