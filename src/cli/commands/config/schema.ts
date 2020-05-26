import * as yup from 'yup';

export const schema = yup
  .object({
    path: yup.string().required(),
  })
  .unknown()
  .required();

export type Schema = yup.InferType<typeof schema>;
