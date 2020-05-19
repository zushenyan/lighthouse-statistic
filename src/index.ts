#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { program } from 'commander';

import * as commandSchemas from './schemas/commands';
import { validateWithStrictAndCast } from './schemas/utils';
import { Reports, ConfigSchema, configSchema, processData } from './lib';
import debug from './debug';
import { PackageJson } from './index.d';

export const readPackageJson = async (): Promise<PackageJson | undefined> => {
  try {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const rawData = await fs.promises.readFile(packageJsonPath);
    const json = JSON.parse(rawData.toString());
    debug(json);
    return json;
  } catch (e) {
    console.error('Something went wrong while reading config.');
    console.error(e);
    process.exit(1);
  }
};

export const readConfig = async (
  filePath: string | undefined = '',
): Promise<ConfigSchema | {} | undefined> => {
  try {
    const absPath = path.resolve(process.cwd(), filePath);
    const rawData = await fs.promises.readFile(absPath);
    const json = JSON.parse(rawData.toString());
    debug(json);
    return json;
  } catch (e) {
    console.error('Something went wrong while reading config.');
    console.error(e);
    process.exit(1);
  }
};

export const writeOutputs = async (
  config: ConfigSchema,
  reports: Reports,
): Promise<void> => {
  try {
    console.log('Writing reports to disk...');
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
    console.log(
      `Done writing reports. Please see "${directoryPath}" for reports.`,
    );
  } catch (e) {
    console.error('Something went wrong while writing reports to disk.');
    console.error(e);
    process.exit(1);
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
    const config = await validateWithStrictAndCast(configSchema, args);
    debug(config);
    const reports = await processData(config);
    debug(reports?.statistic);
    if (reports) {
      await writeOutputs(config, reports);
    }
  } catch (e) {
    console.error('Something went wrong while running "start" command.');
    console.error(e);
    process.exit(1);
  }
};

export const configAction = async (path: string): Promise<void> => {
  try {
    await commandSchemas.config.validate({ path }, { stripUnknown: true });
    const rawConfig = await readConfig(path);
    const config = await validateWithStrictAndCast(configSchema, rawConfig);
    debug(config);
    const reports = await processData(config);
    debug(reports?.statistic);
    if (reports) {
      await writeOutputs(config, reports);
    }
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
