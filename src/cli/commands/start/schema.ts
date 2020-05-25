import * as yup from 'yup';

export const schema = yup
  .object({
    url: yup.string().url().required(),
    runs: yup.number().positive().default(1),
  })
  .required();

export type Schema = yup.InferType<typeof schema>;
