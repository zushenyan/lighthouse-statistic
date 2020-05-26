import fs from 'fs';
import * as R from 'ramda';
import { Ora } from 'ora';

import {
  Report,
  Schema as ConfigSchema,
  schema as configSchema,
  defaultOutputOptions,
} from '../../core';

type Tuple<A, B> = [A, B];
type Files = Tuple<string, Uint8Array>[];
export type OutputWriterArgs = Tuple<string, Files>;

export const validateWithStrictAndCast = async (
  variable: unknown,
): Promise<ConfigSchema> => {
  const result = await configSchema.validate(variable, { strict: true });
  return await configSchema.validate(result);
};

export const readJson = R.curry(
  async (
    fileReader: (filePath: string) => Promise<Buffer>,
    jsonParser: (data: string) => Record<string, unknown> | string,
    debugLogger: (...args: unknown[]) => void,
    errorHandler: (e: Error) => void,
    filePath: string,
  ): Promise<unknown> => {
    try {
      const rawData = await fileReader(filePath);
      const json = jsonParser(rawData.toString());
      debugLogger(json);
      return json;
    } catch (e) {
      errorHandler(e);
    }
  },
);

export const writeOutputs = R.curry(
  async (
    dirMaker: (
      path: fs.PathLike,
      options: fs.MakeDirectoryOptions & { recursive: true },
    ) => Promise<string>,
    fileWriter: (path: fs.PathLike, data: Uint8Array) => Promise<void>,
    spinner: Ora,
    errorHandler: (e: Error) => void,
    directoryPath: string,
    files: Files,
  ): Promise<void> => {
    try {
      spinner.start('Writing reports to disk...');
      await dirMaker(directoryPath, { recursive: true });
      await Promise.all([
        fileWriter(files[0][0], files[0][1]),
        fileWriter(files[1][0], files[1][1]),
      ]);
      spinner.succeed(
        `Done writing reports. Please see "${directoryPath}" for reports.`,
      );
    } catch (e) {
      spinner.fail('Something went wrong while writing reports to disk.');
      errorHandler(e);
    }
  },
);

export const createFiles = R.curry(
  (
    pathResolver: (...args: string[]) => string,
    transformer: (value: unknown) => Uint8Array,
    config: ConfigSchema,
    report: Report,
  ): OutputWriterArgs => {
    const directoryPath = pathResolver(
      config.output?.basePath || defaultOutputOptions.basePath,
      config.output?.directoryName || defaultOutputOptions.directoryName,
    );
    const reportsPath = pathResolver(
      directoryPath,
      config.output?.reportsFilename || defaultOutputOptions.reportsFilename,
    );
    const statisticPath = pathResolver(
      directoryPath,
      config.output?.statisticFilename ||
        defaultOutputOptions.statisticFilename,
    );
    return [
      directoryPath,
      [
        [reportsPath, transformer(report.lighthouseReports)],
        [statisticPath, transformer(report.statistic)],
      ],
    ];
  },
);

export const runBenchmark = R.curry(
  async (
    validator: (variable: unknown) => Promise<ConfigSchema>,
    debugLogger: (...args: unknown[]) => void,
    collector: (config: ConfigSchema) => Promise<Report | undefined>,
    outputWriter: (directoryPath: string, files: Files) => Promise<void>,
    fileCreator: (config: ConfigSchema, report: Report) => OutputWriterArgs,
    spinner: Ora,
    args: unknown,
  ): Promise<void> => {
    const config = await validator(args);
    debugLogger(config);
    spinner.start();
    const reports = await collector(config);
    spinner.succeed(
      `Done benchmarking ${reports?.statistic.runs.total} times. Failed ${reports?.statistic.runs.failed} times.`,
    );
    debugLogger(reports?.statistic);
    if (reports) {
      await outputWriter(...fileCreator(config, reports));
    }
  },
);
