import yup from 'yup';
import { ParsedArgs } from 'minimist';
import { argvSchema } from './argv';

export type ArgvSchema = ParsedArgs & yup.InferType<typeof argvSchema>;
