export interface TraceStep {
  stepName: string;
  stepType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  durationMs?: number;
  inputData?: Record<string, unknown> | null;
  outputData?: Record<string, unknown> | null;
  errorMessage?: string;
  sequenceNum: number;
  /** For conditional steps: which route was taken */
  routeTaken?: string;
  /** For conditional steps: the field value that determined the route */
  routeFieldValue?: unknown;
}

export interface TraceData {
  executionId: string;
  pipeline: string;
  status: string;
  steps: TraceStep[];
  configHash: string;
  startedAt: string;
  completedAt?: string;
}

export const TRACE_STATUS_COLORS: Record<TraceStep['status'], string> = {
  completed: '#a6e3a1',
  failed: '#f38ba8',
  running: '#89b4fa',
  skipped: '#6c7086',
  pending: '#6c7086',
};
