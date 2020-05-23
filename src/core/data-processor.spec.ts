import {
  getNonNilArray,
  createScoreArr,
  createNumericValueArr,
  createNumbers,
  createAuditDetail,
  auditDetailTransformer,
  createAudits,
  createReport,
} from './data-processor';
import * as R from 'ramda';

describe('getNonNilArray', () => {
  const func = getNonNilArray(R.identity);

  test('when it receives empty', () => {
    expect(func([])).toEqual([]);
  });

  test('should work', () => {
    expect(func([0, 1, null, 2, undefined])).toEqual([0, 1, 2]);
  });
});

describe('createScoreArr', () => {
  test('should work', () => {
    const data = [
      { audits: { foo: { title: '', id: '', score: 123 } }, categories: {} },
      { audits: { foo: { title: '', id: '', score: 456 } }, categories: {} },
    ];
    expect(createScoreArr('foo')(data)).toEqual([123, 456]);
  });
});

describe('createNumericValueArr', () => {
  test('should work', () => {
    const data = [
      {
        audits: { foo: { title: '', id: '', numericValue: 123 } },
        categories: {},
      },
      {
        audits: { foo: { title: '', id: '', numericValue: 456 } },
        categories: {},
      },
    ];
    expect(createNumericValueArr('foo')(data)).toEqual([123, 456]);
  });
});

describe('createNumbers', () => {
  test('should work', () => {
    expect(createNumbers([1])).toEqual({
      max: 1,
      min: 1,
      avg: 1,
      med: 1,
    });
    expect(createNumbers([])).toEqual({
      max: -Infinity,
      min: Infinity,
      avg: NaN,
      med: NaN,
    });
  });
});

describe('createAuditDetail', () => {
  test('should work', () => {
    const data = {
      score: [1],
      numericValue: [1],
    };
    expect(createAuditDetail(data)).toEqual({
      score: createNumbers(data.score),
      numericValue: createNumbers(data.numericValue),
    });
  });
});

describe('auditDetailTransformer', () => {
  test('should work', () => {
    const data = [
      {
        audits: { foo: { title: '', id: '', score: 234, numericValue: 123 } },
        categories: {},
      },
      {
        audits: { foo: { title: '', id: '', score: 456, numericValue: 456 } },
        categories: {},
      },
    ];
    expect(auditDetailTransformer(data)(undefined, 'foo')).toEqual(
      createAuditDetail({
        score: createScoreArr('foo')(data),
        numericValue: createNumericValueArr('foo')(data),
      }),
    );
  });
});

describe('createAudits', () => {
  test('should work', () => {
    const data = [
      {
        audits: {
          foo: { title: '', id: '', score: 234, numericValue: 123 },
          bar: { title: '', id: '', score: 234, numericValue: 123 },
        },
        categories: {},
      },
      {
        audits: {
          foo: { title: '', id: '', score: 456, numericValue: 456 },
          bar: { title: '', id: '', score: 456, numericValue: 456 },
        },
        categories: {},
      },
    ];
    expect(createAudits(data)).toEqual({
      foo: createAuditDetail({
        score: createScoreArr('foo')(data),
        numericValue: createNumericValueArr('foo')(data),
      }),
      bar: createAuditDetail({
        score: createScoreArr('bar')(data),
        numericValue: createNumericValueArr('bar')(data),
      }),
    });
  });
  test('should work for empty array', () => {
    expect(createAudits([])).toEqual({});
  });
});

describe('createReport', () => {
  test('should work', () => {
    const url = 'url';
    const totalRun = 123;
    const failedRun = 123;
    const lighthouseReports = [
      {
        audits: {
          foo: { title: '', id: '', score: 234, numericValue: 123 },
          bar: { title: '', id: '', score: 234, numericValue: 123 },
        },
        categories: {},
      },
      {
        audits: {
          foo: { title: '', id: '', score: 456, numericValue: 456 },
          bar: { title: '', id: '', score: 456, numericValue: 456 },
        },
        categories: {},
      },
    ];
    expect(
      createReport({
        url,
        totalRun,
        failedRun,
        lighthouseReports,
      }),
    ).toEqual({
      lighthouseReports,
      statistic: {
        url,
        runs: {
          total: totalRun,
          failed: failedRun,
        },
        audits: createAudits(lighthouseReports),
      },
    });
  });
});
