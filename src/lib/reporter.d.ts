import { Report as LighthouseReport } from 'lighthouse';
import { ConfigSchema } from './config-schema.d';

export interface BenchmarkReport {
  reports: Array<LighthouseReport>;
  failed: number;
}

export interface CollectReportsArguments {
  config: ConfigSchema;
  stepCallback?: (index: number) => void;
  errorCallback?: (index: number, failed: number) => void;
}
