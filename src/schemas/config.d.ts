import yup from 'yup';
import { configSchema } from './config';

export type ConfigSchema = yup.InferType<typeof configSchema>;
