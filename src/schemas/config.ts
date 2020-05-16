import * as yup from 'yup';

import { AuditKindsEnum } from '../lighthouse/constants';

export const config = yup.object({
  url: yup.string().required('The "url" field cannot be empty.'),
  runs: yup
    .number()
    .positive('The "runs" field should be positive.')
    .required('The "runs" field cannot be empty.')
    .default(1),
  port: yup
    .number()
    .positive('The "port" field should be a valid number.')
    .optional(),
  audits: yup
    .array(yup.string().oneOf(Object.values(AuditKindsEnum)))
    .required('The "audits" field cannot be empty.')
    .default([
      AuditKindsEnum['first-meaningful-paint'],
      AuditKindsEnum['first-contentful-paint'],
      AuditKindsEnum['first-cpu-idle'],
      AuditKindsEnum['time-to-first-byte'],
    ]),
});
