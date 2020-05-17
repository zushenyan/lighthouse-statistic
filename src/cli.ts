#!/usr/bin/env node
import 'module-alias/register';

import fs from 'fs';
import path from 'path';
import { program } from 'commander';

import packageJson from '../package.json';

import * as commandSchemas from './schemas/commands';
import { Config as ConfigSchema } from './schemas/config.d';
import { config as configSchema } from './schemas/config';

import { processData } from './index';

export const readConfig = async (
  filePath: string | undefined = '',
): Promise<ConfigSchema | {} | undefined> => {
  try {
    const absPath = path.resolve(process.cwd(), filePath);
    const rawData = await fs.promises.readFile(absPath);
    const json = JSON.parse(rawData.toString());
    return json;
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

export const startAction = async (
  url: string,
  opts: Record<string, unknown>,
): Promise<void> => {
  try {
    const args = await commandSchemas.start.validate({ url, ...opts });
    const config = await configSchema.validate(args, { strict: true });
    const result = await processData(config);
    console.log(result);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

export const configAction = async (path: string): Promise<void> => {
  try {
    const rawConfig = await readConfig(path);
    const config = await configSchema.validate(rawConfig, {
      strict: true,
    });
    const result = await processData(config);
    console.log(result);
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
  .option('-p, --port <number>', 'The port you want chrome to run on.')
  .action(startAction);

program.parse(process.argv);
