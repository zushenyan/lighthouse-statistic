declare module 'lighthouse' {
  // the type is from
  // https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L145
  interface SharedFlagsSettings {
    output?: Array<string>;
    locale?: string;
    maxWaitForFcp?: number;
    maxWaitForLoad?: number;
    blockedUrlPatterns?: Array<string>;
    additionalTraceCategories?: string;
    auditMode?: boolean | string;
    gatherMode?: boolean | string;
    disableStorageReset?: boolean;
    emulatedFormFactor?: 'mobile' | 'desktop' | 'none';
    throttlingMethod?: 'devtools' | 'simulate' | 'provided';
    throttling?: {
      rttMs?: number;
      throughputKbps?: number;
      requestLatencyMs?: number;
      downloadThroughputKbps?: number;
      uploadThroughputKbps?: number;
      cpuSlowdownMultiplier?: number;
    };
    onlyAudits?: Array<string>;
    onlyCategories?: Array<string>;
    skipAudits?: Array<string>;
    extraHeaders?: string;
    channel?: string;
    precomputedLanternData?: unknown;
    budgets?: Array<unknown>;
  }

  // the type is from
  // https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L192
  export interface Flags extends SharedFlagsSettings {
    port?: number;
    hostname?: string;
    logLevel?: 'silent' | 'error' | 'info' | 'verbose';
    configPath?: string;
    plugins?: Array<string>;
  }

  // the type is from
  // https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts#L16
  export interface Config {
    extends?: 'lighthouse:default' | string | boolean;
    settings?: SharedFlagsSettings;
    passes?: Array<Record<string, unknown>> | null;
    audits?: Array<Record<string, unknown>> | null;
    categories?: Record<string, unknown> | null;
    groups?: Record<string, unknown> | null;
    plugins?: Array<string>;
  }

  interface AuditKindDetail {
    id: string;
    title: string;
    score: number;
    numericValue: number;
  }

  interface CategoryKindDetail {
    title: string;
    id: string;
    score: number;
  }

  export interface Report {
    audits: {
      [key: string]: AuditKindDetail;
    };
    categories: {
      [key: string]: CategoryKindDetail;
    };
  }

  export interface Result {
    lhr: Report;
    report: unknown;
  }

  export default function (
    url: string,
    flags: Flags | undefined,
    config: Config | undefined,
  ): Promise<Result>;
}
