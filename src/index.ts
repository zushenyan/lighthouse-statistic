import 'module-alias/register';

import lighthouse, {
  Report as LighthouseReport,
  AuditKindDetail,
} from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import R from 'ramda';
import { max, min, mean, median } from 'mathjs';

import { Report } from './index.d';
import { processArgv } from './bootup';

const launchChromeAndRunLighthouse = async (
  url: string,
  port?: number,
): Promise<LighthouseReport> => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless'],
    port,
  });
  const results = await lighthouse(url, {
    port: chrome.port,
    onlyCategories: ['performance'],
  });
  await chrome.kill();
  return results.lhr;
};

(async (): Promise<void> => {
  try {
    const config = await processArgv();
    console.log('Load config successfully.');
    const reports: Array<LighthouseReport> = [];
    for (let i = 0; i < config.runs; i++) {
      console.log(`Start running ${i + 1} time(s)...`);
      reports.push(await launchChromeAndRunLighthouse(config.url, config.port));
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
    console.log(results);
  } catch (e) {
    console.log(e.message);
  }
})();
