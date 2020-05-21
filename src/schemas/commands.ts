import * as yup from 'yup';

export const start = yup.object({
  url: yup.string().url().required(),
  runs: yup.number().positive().default(1),
});

export const config = yup.object({
  path: yup.string().required(),
});

export type Start = yup.InferType<typeof start>;
export type Config = yup.InferType<typeof config>;
