import lighthouse, { Report as LighthouseReport } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

import { ConfigSchema } from './config-schema.d';
import { BenchmarkReport, CollectReportsArguments } from './reporter.d';
import { Report } from './data-processor.d';
import { createReport } from './data-processor';

export const runLighthouse = async ({
  url,
  chrome: chromeConfig,
  lighthouse: lighthouseConfig,
}: ConfigSchema): Promise<LighthouseReport | undefined> => {
  const chrome = await chromeLauncher.launch(chromeConfig);
  try {
    const results = await lighthouse(
      url,
      { port: chrome?.port, ...lighthouseConfig?.flags },
      lighthouseConfig?.config,
    );
    return results.lhr;
  } catch (e) {
    throw e;
  } finally {
    if (chrome) await chrome.kill();
  }
};

export const collectLighthouseReports = async ({
  config,
  stepCallback = (): void => undefined,
  errorCallback = (): void => undefined,
}: CollectReportsArguments): Promise<BenchmarkReport> => {
  const lighthouseReports: Array<LighthouseReport> = [];
  let failed = 0;
  for (let i = 0, times = i + 1; i < config.runs; i++, times++) {
    stepCallback(i);
    try {
      const report = await runLighthouse(config);
      if (report) {
        lighthouseReports.push(report);
      }
    } catch (e) {
      failed = failed + 1;
      errorCallback(i, failed);
    }
  }
  return {
    reports: lighthouseReports,
    failed,
  };
};

export const collectReports = async (
  args: CollectReportsArguments,
): Promise<Report | undefined> => {
  const { reports, failed } = await collectLighthouseReports(args);
  return createReport({
    url: args.config.url,
    totalRun: args.config.runs,
    failedRun: failed,
    lighthouseReports: reports,
  });
};
