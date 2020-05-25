import debug from '@/debug';
import { runBenchmark } from '@/cli/utils';
import { schema } from './schema';

export const action = async (
  url: string,
  opts: Record<string, unknown>,
): Promise<void> => {
  try {
    const args = await schema.validate(
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
