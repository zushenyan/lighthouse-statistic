import { Report as LighthouseReport } from 'lighthouse';

export interface Numbers {
  max: number;
  min: number;
  avg: number;
  med: number;
}

export interface Statistic {
  url: string;
  runs: {
    total: number;
    failed: number;
  };
  audits: {
    [k: string]: {
      score: Numbers;
      numericValue: Numbers;
    };
  };
}

export interface BenchmarkReport {
  reports: Array<LighthouseReport>;
  failed: number;
}

export interface Reports {
  lighthouseReports: Array<LighthouseReport>;
  statistic: Statistic;
}
