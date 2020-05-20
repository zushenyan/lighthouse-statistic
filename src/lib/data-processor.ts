import { Report as LighthouseReport } from 'lighthouse';
import * as R from 'ramda';

import { Statistic, AuditDetail, Numbers, Report } from './data-processor.d';

export type GetNonNilArrayReturnType<U, T> = (v: U[]) => T[];

export const getNonNilArray = <U, T>(
  transformer: (v: U) => T,
): GetNonNilArrayReturnType<U, T> =>
  R.pipe(R.map(transformer), R.reject(R.isNil));

export const createScoreArr = (
  auditKey: string,
): GetNonNilArrayReturnType<LighthouseReport, number> =>
  getNonNilArray(R.view(R.lensPath(['audits', auditKey, 'score'])));

export const createNumericValueArr = (
  auditKey: string,
): GetNonNilArrayReturnType<LighthouseReport, number> =>
  getNonNilArray(R.view(R.lensPath(['audits', auditKey, 'numericValue'])));

export const createNumbers = (arr: number[]): Numbers => ({
  max: Math.max(...arr),
  min: Math.min(...arr),
  avg: R.mean(arr),
  med: R.median(arr),
});

export const createAuditDetail = ({
  score,
  numericValue,
}: {
  score: number[];
  numericValue: number[];
}): AuditDetail => ({
  score: createNumbers(score),
  numericValue: createNumbers(numericValue),
});

export const auditDetailTransformer = (
  lighthouseReports: Array<LighthouseReport>,
) => (acc: AuditDetail, auditKey: string): AuditDetail =>
  createAuditDetail({
    score: createScoreArr(auditKey)(lighthouseReports),
    numericValue: createNumericValueArr(auditKey)(lighthouseReports),
  });

export const createAudits = (
  lighthouseReports: Array<LighthouseReport>,
): Statistic['audits'] =>
  R.reduceBy(
    auditDetailTransformer(lighthouseReports),
    {
      score: { max: 0, min: 0, avg: 0, med: 0 },
      numericValue: { max: 0, min: 0, avg: 0, med: 0 },
    },
    R.identity,
    Object.keys(lighthouseReports[0]?.audits),
  );

export const createReport = ({
  url,
  totalRun,
  failedRun,
  lighthouseReports,
}: {
  url: string;
  totalRun: number;
  failedRun: number;
  lighthouseReports: LighthouseReport[];
}): Report => ({
  lighthouseReports,
  statistic: {
    url: url,
    runs: {
      total: totalRun,
      failed: failedRun,
    },
    audits: createAudits(lighthouseReports),
  },
});
