import * as yup from 'yup';
import { AuditKindsEnum } from '../lighthouse/constants';
import { url, runs, port } from './argv';

export const audits = yup
  .array()
  .of(yup.string().oneOf(Object.values(AuditKindsEnum)));

export const configSchema = yup.object({
  url: url
    .required('The "url" field in JSON file cannot be empty.')
    .default(''),
  runs: runs
    .required('The "runs" field in JSON file cannot be empty.')
    .default(1),
  port: port.optional(),
  audits: audits
    .required('The "audits" field in JSON file cannot be empty.')
    .default([
      AuditKindsEnum['first-meaningful-paint'],
      AuditKindsEnum['first-contentful-paint'],
      AuditKindsEnum['first-cpu-idle'],
      AuditKindsEnum['time-to-first-byte'],
    ]),
});
