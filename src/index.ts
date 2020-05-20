#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import ora from 'ora';

import * as commandSchemas from './schemas/commands';
import { validateWithStrictAndCast } from './schemas/utils';
import { Report, ConfigSchema, configSchema, collectReports } from './lib';
import debug from './debug';
import { PackageJson } from './index.d';

export const readJson = async <T>(filePath: string): Promise<T> => {
  const rawData = await fs.promises.readFile(filePath);
  const json = JSON.parse(rawData.toString());
  debug(json);
  return json;
};

export const readPackageJson = async (): Promise<PackageJson | undefined> => {
  try {
    const filePath = path.resolve(__dirname, '..', 'package.json');
    return await readJson(filePath);
  } catch (e) {
    console.error('Something went wrong while loading "package.json".');
    console.error(e);
    process.exit(1);
  }
};

export const readConfig = async (
  filePath: string | undefined = '',
): Promise<ConfigSchema | {} | undefined> => {
  try {
    const absFilePath = path.resolve(process.cwd(), filePath);
    return await readJson(absFilePath);
  } catch (e) {
    console.error('Something went wrong while reading config.');
    console.error(e);
    process.exit(1);
  }
};

export const writeOutputs = async (
  config: ConfigSchema,
  reports: Report,
): Promise<void> => {
  const spinner = ora('Writing reports to disk...').start();
  try {
    const directoryPath = path.resolve(
      config.output.basePath,
      config.output.directoryName,
    );
    await fs.promises.mkdir(directoryPath, { recursive: true });
    const reportsPath = path.resolve(
      directoryPath,
      config.output.reportsFilename,
    );
    const statisticPath = path.resolve(
      directoryPath,
      config.output.statisticFilename,
    );
    const reportsRawData = new Uint8Array(
      Buffer.from(JSON.stringify(reports.lighthouseReports)),
    );
    const statisticRawData = new Uint8Array(
      Buffer.from(JSON.stringify(reports.statistic)),
    );
    await fs.promises.writeFile(reportsPath, reportsRawData);
    await fs.promises.writeFile(statisticPath, statisticRawData);
    spinner.succeed(
      `Done writing reports. Please see "${directoryPath}" for reports.`,
    );
  } catch (e) {
    spinner.fail('Something went wrong while writing reports to disk.');
    console.error(e);
    process.exit(1);
  }
};

export const runBenchmark = async (
  args: Record<string, unknown> | undefined,
): Promise<void> => {
  const config = await validateWithStrictAndCast(configSchema, args);
  debug(config);
  const spinner = ora().start();
  const reports = await collectReports({
    config,
    stepCallback: (index) => {
      spinner.text = `Running ${index + 1} of ${config.runs} times...`;
    },
  });
  spinner.succeed(
    `Done benchmarking ${reports?.statistic.runs.total} times. Failed ${reports?.statistic.runs.failed} times.`,
  );
  debug(reports?.statistic);
  if (reports) {
    await writeOutputs(config, reports);
  }
};

export const startAction = async (
  url: string,
  opts: Record<string, unknown>,
): Promise<void> => {
  try {
    const args = await commandSchemas.start.validate(
      { url, ...opts },
      { stripUnknown: true },
    );
    debug(args);
    await runBenchmark(args);
  } catch (e) {
    console.error('Something went wrong while running "start" command.');
    console.error(e);
    process.exit(1);
  }
};

export const configAction = async (path: string): Promise<void> => {
  try {
    const { path: validatedPath } = await commandSchemas.config.validate(
      { path },
      { stripUnknown: true },
    );
    debug('path', path);
    debug('validatedPath', validatedPath);
    const rawConfig = await readConfig(validatedPath);
    await runBenchmark(rawConfig);
  } catch (e) {
    console.error('Something went wrong while running "config" command.');
    console.error(e);
    process.exit(1);
  }
};

(async (): Promise<void> => {
  const packageJson = await readPackageJson();
  program
    .version(packageJson?.version || '')
    .description(packageJson?.description || '');

  program
    .command('config <path>')
    .description('The path to the custom benchmark config.')
    .action(configAction);

  program
    .command('start <url>', { isDefault: true })
    .description(
      'Start running benchmark with default benchmark setting. The <url> is the webpage you want to test against.',
    )
    .option(
      '-r, --runs <number>',
      'How many times do you want to perform benchmark.',
    )
    .action(startAction);

  program.parse(process.argv);
})();
