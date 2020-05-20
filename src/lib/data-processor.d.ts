import { Report as LighthouseReport } from 'lighthouse';

export interface Numbers {
  max: number;
  min: number;
  avg: number;
  med: number;
}

export interface AuditDetail {
  score: Numbers;
  numericValue: Numbers;
}

export interface Statistic {
  url: string;
  runs: {
    total: number;
    failed: number;
  };
  audits: {
    [k: string]: AuditDetail;
  };
}

export interface Report {
  lighthouseReports: Array<LighthouseReport>;
  statistic: Statistic;
}
