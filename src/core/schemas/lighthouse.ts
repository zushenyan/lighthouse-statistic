import { Flags, Config } from 'lighthouse';
import * as yup from 'yup';

export interface Options {
  flags?: Flags;
  config?: Config;
}

export const defaultOptions = {
  flags: {
    onlyCategories: ['performance'],
  },
};

export const schema = yup
  .object<Options>({
    flags: yup.object<Flags>(),
    config: yup.object<Config>(),
  })
  .noUnknown()
  .default(defaultOptions);

export type Schema = yup.InferType<typeof schema>;
