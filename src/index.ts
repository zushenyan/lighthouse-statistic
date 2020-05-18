#!/usr/bin/env node
import 'module-alias/register';

import lighthouse, {
  Report as LighthouseReport,
  AuditKindDetail,
} from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import R from 'ramda';
import { max, min, mean, median } from 'mathjs';

import { Config as ConfigSchema } from './schemas/config.d';
import { Statistic, Reports } from './index.d';

const launchChrome = async (
  url: string,
  config: ConfigSchema,
): Promise<chromeLauncher.LaunchedChrome | undefined> => {
  try {
    return await chromeLauncher.launch(config.chrome);
  } catch (e) {
    console.log('something went wrong while launching Chrome.');
    console.log(e);
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

export const processData = async (
  config: ConfigSchema,
): Promise<Reports | undefined> => {
  try {
    const lighthouseReports: Array<LighthouseReport> = [];
    for (let i = 0, times = i + 1; i < config.runs; i++) {
      console.log(`Start running ${times} of ${config.runs} times.`);
      try {
        const report = await runLighthouse(config, config.url);
        if (report) {
          lighthouseReports.push(report);
        }
      } catch (e) {
        console.log(
          `Something went wrong while performing ${times} run. Will skip this result.`,
        );
        console.log(e);
      }
    }
    console.log('Done running.');
    const auditKindLens = config.audits.map((v) => R.lensPath(['audits', v]));
    const statistic = auditKindLens.reduce<Statistic>(
      (acc, len, index) => {
        const detailArr = lighthouseReports.map<AuditKindDetail>(R.view(len));
        const numericValueArr = detailArr.map((v) => v.numericValue);
        acc.audits[config.audits[index]] = {
          max: max(numericValueArr),
          min: min(numericValueArr),
          avg: mean(numericValueArr),
          med: median(numericValueArr),
        };
        return acc;
      },
      {
        url: config.url,
        runs: config.runs,
        audits: {},
      },
    );
    return {
      lighthouseReports,
      statistic,
    };
  } catch (e) {
    console.log(e.message);
  }
};
