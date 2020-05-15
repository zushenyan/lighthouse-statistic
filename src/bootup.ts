import fs from 'fs';
import path from 'path';
import minimist from 'minimist';

import { ArgvSchema } from './schemas/argv.d';
import { argvSchema } from './schemas/argv';
import { ConfigSchema } from './schemas/config.d';
import { configSchema } from './schemas/config';

export const readConfig = async (
  filePath: string | undefined = '',
): Promise<ConfigSchema | {} | undefined> => {
  try {
    const absPath = path.resolve(process.cwd(), filePath);
    const rawData = await fs.promises.readFile(absPath);
    const json = JSON.parse(rawData.toString());
    return json;
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(e.message);
      console.log('Will use built-in config instead.');
    } else {
      console.log(e.message);
    }
  }
};

export const processArgv = async (): Promise<ConfigSchema> => {
  const argv = minimist<ArgvSchema>(process.argv);
  const args = await argvSchema.validate(argv);
  const jsonFile = await readConfig(args.configPath);
  const config = await configSchema.validate(
    { ...jsonFile, ...args },
    { stripUnknown: true },
  );
  return config;
};
