#!/usr/bin/env node
import path from 'path';
import { program } from 'commander';

import { start, config } from './commands';
import { readJson } from './utils';

interface PackageJson {
  version?: string;
  description?: string;
}

(async (): Promise<void> => {
  const packageJson = (await readJson((e) => {
    console.error('Something went wrong while loading "package.json".');
    console.error(e);
    process.exit(1);
  }, path.resolve(__dirname, '..', '..', 'package.json'))) as PackageJson;
  program
    .version(packageJson?.version || '')
    .description(packageJson?.description || '');
  program
    .command('config <path>')
    .description('The path to the custom benchmark config.')
    .action(config);
  program
    .command('start <url>', { isDefault: true })
    .description(
      'Start running benchmark with default benchmark setting. The <url> is the webpage you want to test against.',
    )
    .option(
      '-r, --runs <number>',
      'How many times do you want to perform benchmark.',
    )
    .action(start);
  program.parse(process.argv);
})();
