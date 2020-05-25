import debug from '@/debug';
import { readConfig, runBenchmark } from '@/cli/utils';
import { schema } from './schema';

export const action = async (path: string): Promise<void> => {
  try {
    const args = await schema.validate({ path }, { stripUnknown: true });
    debug('path', path);
    debug('args', args);
    const rawConfig = await readConfig(args?.path);
    await runBenchmark(rawConfig);
  } catch (e) {
    console.error('Something went wrong while running "config" command.');
    console.error(e);
    process.exit(1);
  }
};
