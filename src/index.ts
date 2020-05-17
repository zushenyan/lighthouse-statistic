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
import { Report } from './index.d';

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
  url: string,
  config: ConfigSchema,
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
    console.log('something went wrong while running lighthouse.');
    console.log(e);
  } finally {
    if (chrome) await chrome.kill();
  }
};

export const processData = async (
  config: ConfigSchema,
): Promise<Report | undefined> => {
  try {
    const reports: Array<LighthouseReport | undefined> = [];
    for (let i = 0; i < config.runs; i++) {
      console.log(`Start running ${i + 1} of ${config.runs} times.`);
      reports.push(await runLighthouse(config.url, config));
    }
    console.log('Done running.');
    const auditKindLens = config.audits.map((v) => R.lensPath(['audits', v]));
    const results = auditKindLens.reduce<Report>(
      (acc, len, index) => {
        const detailArr = reports.map<AuditKindDetail>(R.view(len));
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
    return results;
  } catch (e) {
    console.log(e.message);
  }
};
