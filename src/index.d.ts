import { Report as LighthouseReport } from 'lighthouse';

export interface Statistic {
  runs: number;
  url: string;
  audits: {
    [k: string]: {
      max: number;
      min: number;
      avg: number;
      med: number;
    };
  };
}

export interface Reports {
  lighthouseReports: Array<LighthouseReport>;
  statistic: Statistic;
}
