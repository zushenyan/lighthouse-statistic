import path from 'path';
import debug from '../../../debug';
import { readJson, runBenchmark } from '../../utils';
import { schema } from './schema';

export const action = async (filePath: string): Promise<void> => {
  try {
    const args = await schema.validate(
      { path: filePath },
      { stripUnknown: true },
    );
    debug('path', filePath);
    debug('args', args);
    const rawConfig = await readJson((e) => {
      console.error('Something went wrong while reading config.');
      console.error(e);
      process.exit(1);
    }, path.resolve(process.cwd(), args?.path));
    await runBenchmark(rawConfig);
  } catch (e) {
    console.error('Something went wrong while running "config" command.');
    console.error(e);
    process.exit(1);
  }
};
