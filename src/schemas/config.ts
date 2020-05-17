import { Flags, Config } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as yup from 'yup';

import { AuditKindsEnum } from '@/lighthouse/constants';

export const config = yup
  .object({
    url: yup.string().required(),
    runs: yup.number().positive().required().default(1),
    audits: yup
      .array(yup.string().oneOf(Object.values(AuditKindsEnum)))
      .required()
      .default([
        AuditKindsEnum['first-meaningful-paint'],
        AuditKindsEnum['first-contentful-paint'],
        AuditKindsEnum['first-cpu-idle'],
        AuditKindsEnum['time-to-first-byte'],
      ]),
    chrome: yup
      .object<chromeLauncher.Options>({
        startingUrl: yup.string().optional(),
        chromeFlags: yup.array(yup.string()).optional(),
        port: yup.number().optional(),
        handleSIGINT: yup.boolean().optional(),
        chromePath: yup.string().optional(),
        userDataDir: yup.string().optional(),
        logLevel: yup
          .string()
          .oneOf(['verbose', 'info', 'error', 'silent'])
          .optional(),
        ignoreDefaultFlags: yup.boolean().optional(),
        connectionPollInterval: yup.number().positive().optional(),
        maxConnectionRetries: yup.number().positive().optional(),
        envVars: yup.object<{ [k: string]: string | undefined }>().optional(),
      })
      .noUnknown()
      .optional()
      .default({
        chromeFlags: ['--headless'],
      }),
    lighthouse: yup
      .object({
        flags: yup
          .object<Flags>()
          .optional()
          .default({
            onlyCategories: ['performance'],
          }),
        config: yup.object<Config>().optional(),
      })
      .optional(),
  })
  .noUnknown();
