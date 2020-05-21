import * as yup from 'yup';

export interface Options {
  basePath?: string;
  directoryName?: string;
  reportsFilename?: string;
  statisticFilename?: string;
}

export const defaultOptions = {
  basePath: '.',
  directoryName: new Date().toISOString(),
  reportsFilename: 'lighthouse-reports.json',
  statisticFilename: 'statistic.json',
};

export const schema = yup
  .object<Options>({
    basePath: yup.string(),
    directoryName: yup.string(),
    reportsFilename: yup.string(),
    statisticFilename: yup.string(),
  })
  .noUnknown()
  .default(defaultOptions);

export type Schema = yup.InferType<typeof schema>;
