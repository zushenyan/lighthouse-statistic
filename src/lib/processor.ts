import lighthouse, { Report as LighthouseReport } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import R from 'ramda';

import { ConfigSchema } from './config-schema.d';
import { Statistic, Reports, BenchmarkReport } from './processor.d';

const launchChrome = async (
  url: string,
  config: ConfigSchema,
): Promise<chromeLauncher.LaunchedChrome | undefined> => {
  try {
    return await chromeLauncher.launch(config.chrome);
  } catch (e) {
    console.error('something went wrong while launching Chrome.');
    console.error(e);
  }
};

const runLighthouse = async (
  config: ConfigSchema,
  url: string,
): Promise<LighthouseReport | undefined> => {
  const chrome = await launchChrome(url, config);
  try {
    const results = await lighthouse(
      url,
      { port: chrome?.port, ...config.lighthouse?.flags },
      config.lighthouse?.config,
    );
    return results.lhr;
  } catch (e) {
    throw e;
  } finally {
    if (chrome) await chrome.kill();
  }
};

const runBenchmark = async (config: ConfigSchema): Promise<BenchmarkReport> => {
  const lighthouseReports: Array<LighthouseReport> = [];
  let failed = 0;
  for (let i = 0, times = i + 1; i < config.runs; i++, times++) {
    console.log(`Running ${times} of ${config.runs} times.`);
    try {
      const report = await runLighthouse(config, config.url);
      if (report) {
        lighthouseReports.push(report);
      }
    } catch (e) {
      failed = failed + 1;
      console.error(
        `Something went wrong while performing ${times} run. Will skip this result.`,
      );
      console.error(e);
    }
  }
  return {
    reports: lighthouseReports,
    failed,
  };
};

const createScoreLens = (v: string): R.Lens =>
  R.lensPath(['audits', v, 'score']);
const createNumericValueLens = (v: string): R.Lens =>
  R.lensPath(['audits', v, 'numericValue']);

export const processData = async (
  config: ConfigSchema,
): Promise<Reports | undefined> => {
  try {
    const { reports: lighthouseReports, failed } = await runBenchmark(config);
    console.log('Done running.');
    const auditKeys = Object.keys(lighthouseReports[0].audits);
    const statistic = auditKeys.reduce<Statistic>(
      (acc, auditKey) => {
        const scoreArr = lighthouseReports.map<number>((v) =>
          R.view(createScoreLens(auditKey), v),
        );
        const numericValueArr = lighthouseReports.map<number>((v) =>
          R.view(createNumericValueLens(auditKey), v),
        );
        const nonNullScoreArr = R.reject(R.isNil)(scoreArr);
        const nonNullNumericValueArr = R.reject(R.isNil)(numericValueArr);
        acc.audits[auditKey] = {
          score: {
            max: Math.max(...nonNullScoreArr),
            min: Math.min(...nonNullScoreArr),
            avg: R.mean(nonNullScoreArr),
            med: R.median(nonNullScoreArr),
          },
          numericValue: {
            max: Math.max(...nonNullNumericValueArr),
            min: Math.min(...nonNullNumericValueArr),
            avg: R.mean(nonNullNumericValueArr),
            med: R.median(nonNullNumericValueArr),
          },
        };
        return acc;
      },
      {
        url: config.url,
        runs: {
          total: config.runs,
          failed: config.runs - failed - 1,
        },
        audits: {},
      },
    );
    return {
      lighthouseReports,
      statistic,
    };
  } catch (e) {
    console.error('Something went wrong while processing data.');
    console.error(e);
    process.exit(1);
  }
};
