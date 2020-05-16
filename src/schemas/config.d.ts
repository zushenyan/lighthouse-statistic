import * as yup from 'yup';
import { config } from './config';

export type Config = yup.InferType<typeof config>;
