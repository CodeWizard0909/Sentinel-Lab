import { ScanResult, Issue, RepairProposal, SandboxExecutionResult, JudgeVerdict } from '../types';
import { MOCK_SCANS_RECORD, SAMPLE_PROJECTS } from '../mock/mockData';

const API_BASE_URL = '/api';

export class SentinelApiService {
  private static isMockMode: boolean = false;

  static setMockMode(enabled: boolean) {
    this.isMockMode = enabled;
  }

  static getMockMode(): boolean {
    return this.isMockMode;
  }

  static async checkHealth(): Promise<{ status: string; aws_connected: boolean; mode: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        return { status: 'healthy', aws_connected: data.aws_connected ?? false, mode: data.mode ?? 'live' };
      }
    } catch {
      // Offline fallback
    }
    return { status: 'mock_active', aws_connected: false, mode: 'mock' };
  }

  static async getScans(): Promise<ScanResult[]> {
    try {
      if (!this.isMockMode) {
        const res = await fetch(`${API_BASE_URL}/scans`);
        if (res.ok) return await res.json();
      }
    } catch (e) {
      console.warn('Falling back to local cache', e);
    }
    return Object.values(MOCK_SCANS_RECORD);
  }

  static async getScanById(scanId: string): Promise<ScanResult | null> {
    try {
      if (!this.isMockMode) {
        const res = await fetch(`${API_BASE_URL}/scans/${scanId}`);
        if (res.ok) return await res.json();
      }
    } catch (e) {
      console.warn('API error, using mock scan', e);
    }
    return MOCK_SCANS_RECORD[scanId] || MOCK_SCANS_RECORD['scan-sample-1'] || null;
  }

  static async initiateScan(projectPayload: {
    projectName: string;
    code: string;
    testCode?: string;
    model?: string;
    sandboxProvider?: string;
  }): Promise<{ scan_id: string; status: string }> {
    const scanId = `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Create new scan record
    const newScan: ScanResult = {
      scan_id: scanId,
      project_name: projectPayload.projectName || 'Autonomous Code Verification',
      status: 'QUEUED',
      created_at: new Date().toISOString(),
      issues: [],
      repairs: [],
      aws_resources: {
        bedrock_model: projectPayload.model || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        agentcore_session_id: `agentcore-${Math.random().toString(36).substring(2, 9)}`,
        s3_artifact_uri: `s3://sentinellab-artifacts/${scanId}/bundle.zip`,
        dynamodb_table: 'sentinellab-scans',
        lambda_request_id: `lambda-${Math.random().toString(36).substring(2, 8)}`
      }
    };

    MOCK_SCANS_RECORD[scanId] = newScan;

    if (!this.isMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/scans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload),
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('Using local orchestrator simulator', err);
      }
    }

    return { scan_id: scanId, status: 'QUEUED' };
  }

  // Poll the real backend API or use mock data
  static async simulateScanProgress(
    scanId: string, 
    onProgress: (status: ScanResult) => void
  ): Promise<ScanResult> {
    if (this.isMockMode) {
      // Return a quick mock resolution
      const current = MOCK_SCANS_RECORD[scanId] || { scan_id: scanId, status: 'COMPLETED' as any };
      current.status = 'COMPLETED';
      onProgress({ ...current });
      return current;
    }

    // Live polling logic
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    let isComplete = false;
    let finalResult: ScanResult | null = null;
    let retries = 0;

    while (!isComplete && retries < 120) { // Max 2 minutes
      try {
        const res = await fetch(`${API_BASE_URL}/scans/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          onProgress(data);
          
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            isComplete = true;
            finalResult = data;
          }
        }
      } catch (err) {
        console.warn('Polling error', err);
      }
      
      if (!isComplete) {
        await sleep(1000);
        retries++;
      }
    }

    return finalResult || { scan_id: scanId, status: 'FAILED', project_name: 'Unknown' } as ScanResult;
  }
}
