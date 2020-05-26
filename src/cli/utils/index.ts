import fs from 'fs';
import path from 'path';
import ora from 'ora';

import { Schema as ConfigSchema, startCollecting } from '../../core';
import debug from '../../debug';

import {
  readJson as _readJson,
  writeOutputs as _writeOutputs,
  runBenchmark as _runBenchmark,
  validateWithStrictAndCast,
  createFiles,
} from './internal';

export const readJson = _readJson(fs.promises.readFile, JSON.parse, debug);

export const runBenchmark = async (args: unknown): Promise<void> => {
  const spinner = ora();
  const stepCallback = (index: number, config: ConfigSchema): void => {
    spinner.text = `Running ${index + 1} of ${config.runs} times...`;
  };
  const transformer = (value: unknown): Uint8Array =>
    new Uint8Array(Buffer.from(JSON.stringify(value)));
  const writeOutputs = _writeOutputs(
    fs.promises.mkdir,
    fs.promises.writeFile,
    ora(),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
  return _runBenchmark(
    validateWithStrictAndCast,
    debug,
    startCollecting({ stepCallback }),
    writeOutputs,
    createFiles(path.resolve, transformer),
    spinner,
  )(args);
};
