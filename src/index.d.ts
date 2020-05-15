import { AuditKinds } from 'lighthouse';

export interface ReportConfig {
  runs: number;
  url: string;
  audits: Array<AuditKinds>;
}

export interface Report {
  runs: number;
  url: string;
  audits: {
    [k in AuditKinds]?: {
      max: number;
      min: number;
      avg: number;
      med: number;
    };
  };
}
