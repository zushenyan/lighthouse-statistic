import lighthouse, { Report as LighthouseReport } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as R from 'ramda';

import { Schema as ConfigSchema } from './schemas';
import { Report, createReport } from './data-processor';

type Launch = typeof chromeLauncher['launch'];
type Lighthouse = typeof lighthouse;

export const runLighthouse = R.curry(
  async (
    launchChrome: Launch,
    lighthouse: Lighthouse,
    config: ConfigSchema,
  ): Promise<LighthouseReport | undefined> => {
    const chrome = await launchChrome(config.chrome);
    try {
      const results = await lighthouse(
        config.url,
        { port: chrome?.port, ...config.lighthouse?.flags },
        config.lighthouse?.config,
      );
      return results.lhr;
    } catch (e) {
      throw e;
    } finally {
      if (chrome) await chrome.kill();
    }
  },
);

type LighthouseRunner = (
  config: ConfigSchema,
) => Promise<LighthouseReport | undefined>;
type StepCallback = (index: number) => void;
type ErrorCallback = (index: number, failed: number) => void;

export const collectLighthouseReports = R.curry(
  async (
    stepCallback: StepCallback | undefined,
    errorCallback: ErrorCallback | undefined,
    lighthouseRunner: LighthouseRunner,
    config: ConfigSchema,
  ): Promise<{
    reports: Array<LighthouseReport>;
    failed: number;
  }> => {
    const lighthouseReports: Array<LighthouseReport> = [];
    let failed = 0;
    for (let i = 0, times = i + 1; i < config.runs; i++, times++) {
      stepCallback?.(i);
      try {
        const report = await lighthouseRunner(config);
        if (report) {
          lighthouseReports.push(report);
        }
      } catch (e) {
        failed = failed + 1;
        errorCallback?.(i, failed);
      }
    }
    return {
      reports: lighthouseReports,
      failed,
    };
  },
);

type LighthouseReportsCollector = (
  config: ConfigSchema,
) => Promise<{
  reports: Array<LighthouseReport>;
  failed: number;
}>;

export const collectReports = R.curry(
  async (
    lighthouseReportsCollector: LighthouseReportsCollector,
    config: ConfigSchema,
  ): Promise<Report | undefined> => {
    const { reports, failed } = await lighthouseReportsCollector(config);
    return createReport({
      url: config.url,
      totalRun: config.runs,
      failedRun: failed,
      lighthouseReports: reports,
    });
  },
);

export const startCollecting = async ({
  config,
  stepCallback = (): void => undefined,
  errorCallback = (): void => undefined,
}: {
  config: ConfigSchema;
  stepCallback?: StepCallback;
  errorCallback?: ErrorCallback;
}): Promise<Report | undefined> =>
  await collectReports(
    collectLighthouseReports(
      stepCallback,
      errorCallback,
      runLighthouse(chromeLauncher.launch, lighthouse),
    ),
    config,
  );
