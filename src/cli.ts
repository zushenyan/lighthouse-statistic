#!/usr/bin/env node
import 'module-alias/register';

import fs from 'fs';
import path from 'path';
import { program } from 'commander';

import packageJson from '../package.json';

import * as commandSchemas from './schemas/commands';
import { Config as ConfigSchema } from './schemas/config.d';
import { config as configSchema } from './schemas/config';
import { validateWithStrictAndCast } from './schemas/utils';

import { processData } from './index';
import { Reports } from './index.d';

export const readConfig = async (
  filePath: string | undefined = '',
): Promise<ConfigSchema | {} | undefined> => {
  try {
    const absPath = path.resolve(process.cwd(), filePath);
    const rawData = await fs.promises.readFile(absPath);
    return JSON.parse(rawData.toString());
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

const writeOutputs = async (
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
    console.log('Done writing reports.');
  } catch (e) {
    console.log('Something went wrong while writing reports to disk.');
    console.log(e);
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
    const reports = await processData(config);
    console.log(reports?.statistic);
    if (reports) {
      await writeOutputs(config, reports);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

export const configAction = async (path: string): Promise<void> => {
  try {
    await commandSchemas.config.validate({ path }, { stripUnknown: true });
    const rawConfig = await readConfig(path);
    const config = await validateWithStrictAndCast(configSchema, rawConfig);
    const reports = await processData(config);
    console.log(reports?.statistic);
    if (reports) {
      await writeOutputs(config, reports);
    }
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

program.version(packageJson.version).description(packageJson.description);

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
