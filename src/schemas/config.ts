import { Flags, Config } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as yup from 'yup';

export const config = yup
  .object({
    url: yup.string().required(),
    runs: yup.number().positive().required().default(1),
    output: yup
      .object({
        basePath: yup.string().default('.'),
        directoryName: yup.string().default(new Date().toISOString()),
        reportsFilename: yup.string().default('lighthouse-reports.json'),
        statisticFilename: yup.string().default('statistic.json'),
      })
      .noUnknown(),
    audits: yup
      .array(yup.string())
      .default([
        'first-meaningful-paint',
        'first-contentful-paint',
        'first-cpu-idle',
        'time-to-first-byte',
      ]),
    chrome: yup
      .object<chromeLauncher.Options>({
        startingUrl: yup.string().notRequired(),
        chromeFlags: yup.array(yup.string()).notRequired(),
        port: yup.number().notRequired(),
        handleSIGINT: yup.boolean().notRequired(),
        chromePath: yup.string().notRequired(),
        userDataDir: yup.string().notRequired(),
        logLevel: yup
          .string()
          .oneOf(['verbose', 'info', 'error', 'silent'])
          .notRequired(),
        ignoreDefaultFlags: yup.boolean().notRequired(),
        connectionPollInterval: yup.number().positive().notRequired(),
        maxConnectionRetries: yup.number().positive().notRequired(),
        envVars: yup
          .object<{ [k: string]: string | undefined }>()
          .notRequired(),
      })
      .noUnknown()
      .notRequired()
      .default({
        chromeFlags: ['--headless'],
      }),
    lighthouse: yup
      .object({
        flags: yup
          .object<Flags>()
          .notRequired()
          .default({
            onlyCategories: ['performance'],
          }),
        config: yup.object<Config>().notRequired(),
      })
      .noUnknown()
      .notRequired(),
  })
  .noUnknown();
