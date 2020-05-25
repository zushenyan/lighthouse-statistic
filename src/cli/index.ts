#!/usr/bin/env node
import 'module-alias/register';

import { program } from 'commander';

import { start, config } from './commands';
import { readPackageJson } from './utils';

(async (): Promise<void> => {
  const packageJson = await readPackageJson();
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
