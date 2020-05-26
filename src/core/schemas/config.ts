import * as yup from 'yup';
import { schema as outputSchema } from './output';
import { schema as chromeSchema } from './chrome';
import { schema as lighthouseSchema } from './lighthouse';

export const urlSchema = yup.string().required();
export const runsSchema = yup.number().positive().required().default(1);

export const schema = yup
  .object({
    url: urlSchema,
    runs: runsSchema,
    output: outputSchema,
    chrome: chromeSchema,
    lighthouse: lighthouseSchema,
  })
  .noUnknown()
  .required();

export type Schema = yup.InferType<typeof schema>;
