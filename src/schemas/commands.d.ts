import * as yup from 'yup';
import { start, config } from './commands';

export type Start = yup.InferType<typeof start>;
export type Config = yup.InferType<typeof config>;
