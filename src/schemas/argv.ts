import * as yup from 'yup';

export const url = yup.string().url();
export const runs = yup.number().positive();
export const port = yup.number().positive();
export const configPath = yup.string();

export const argvSchema = yup.object({
  url: url.optional(),
  runs: runs.optional().default(1),
  port: port.optional(),
  configPath: configPath.optional(),
});
