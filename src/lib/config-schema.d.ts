import * as yup from 'yup';
import { configSchema } from './config-schema';

export type ConfigSchema = yup.InferType<typeof configSchema>;
