import * as yup from 'yup';

export const start = yup.object({
  url: yup.string().url().required(),
  runs: yup.number().positive().optional().default(1),
  port: yup.number().positive().optional(),
});

export const config = yup.object({
  path: yup.string().required(),
});
