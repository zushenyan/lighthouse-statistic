import * as yup from 'yup';
import { Options } from 'chrome-launcher';

export const defaultOptions = {
  chromeFlags: ['--headless'],
};

export const schema = yup
  .object<Options>({
    startingUrl: yup.string(),
    chromeFlags: yup.array(),
    port: yup.number(),
    handleSIGINT: yup.boolean(),
    chromePath: yup.string(),
    userDataDir: yup.string(),
    logLevel: yup.string().oneOf(['verbose', 'info', 'error', 'silent']),
    ignoreDefaultFlags: yup.boolean(),
    connectionPollInterval: yup.number().positive(),
    maxConnectionRetries: yup.number().positive(),
    envVars: yup.object<{ [k: string]: string | undefined }>(),
  })
  .noUnknown()
  .default(defaultOptions);

export type Schema = yup.InferType<typeof schema>;
