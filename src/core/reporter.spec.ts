// import { mocked } from 'ts-jest/utils';
// import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { createReport } from './data-processor';
import {
  runLighthouse,
  collectLighthouseReports,
  collectReports,
} from './reporter';

// jest.mock('chrome-launcher');
// jest.mock('lighthouse');

describe('runLighthouse', () => {
  const config = {
    url: 'url',
    runs: 1,
    chrome: {},
    lighthouse: {},
  };
  const report = {
    lhr: { audits: {}, categories: {} },
    report: {},
  };
  const mockedKill = jest.fn(async () => await Promise.resolve());
  const launchChrome = jest.fn(
    async (): Promise<chromeLauncher.LaunchedChrome> =>
      // pass mocking process as it requires too much effort.
      // @ts-expect-error
      await Promise.resolve({
        kill: mockedKill,
        pid: 999,
        port: 123,
        process: {},
      }),
  );

  afterEach(() => {
    mockedKill.mockReset();
  });

  test('should work', async () => {
    const lighthouse = jest.fn(async () => await Promise.resolve(report));
    await expect(
      runLighthouse(launchChrome, lighthouse, config),
    ).resolves.toEqual(report.lhr);
    expect(mockedKill).toHaveBeenCalledTimes(1);
  });

  test('should throw error', async () => {
    const error = 'foobar';
    const lighthouse = jest.fn(async () => await Promise.reject(error));
    await expect(
      runLighthouse(launchChrome, lighthouse, config),
    ).rejects.toEqual(error);
    expect(mockedKill).toHaveBeenCalledTimes(1);
  });
});

describe('collectLighthouseReports', () => {
  const report = {
    audits: {},
    categories: {},
  };
  const config = {
    url: 'url',
    runs: 0,
  };
  const stepCallback = jest.fn();
  const errorCallback = jest.fn();

  afterEach(() => {
    stepCallback.mockReset();
    errorCallback.mockReset();
  });

  test('when config.runs is 0', async () => {
    const lighthouseRunner = jest.fn();
    await expect(
      collectLighthouseReports(stepCallback, errorCallback, lighthouseRunner, {
        ...config,
        runs: 0,
      }),
    ).resolves.toEqual({
      reports: [],
      failed: 0,
    });
    expect(lighthouseRunner).toHaveBeenCalledTimes(0);
    expect(stepCallback).toHaveBeenCalledTimes(0);
    expect(errorCallback).toHaveBeenCalledTimes(0);
  });

  test('when all lighthouse have successfully performed', async () => {
    const lighthouseRunner = jest.fn(async () => await Promise.resolve(report));
    await expect(
      collectLighthouseReports(stepCallback, errorCallback, lighthouseRunner, {
        ...config,
        runs: 2,
      }),
    ).resolves.toEqual({
      reports: [report, report],
      failed: 0,
    });
    expect(lighthouseRunner).toHaveBeenCalledTimes(2);
    expect(stepCallback).toHaveBeenCalledTimes(2);
    expect(errorCallback).toHaveBeenCalledTimes(0);
  });

  test('when failed', async () => {
    const lighthouseRunner = jest.fn(async () => await Promise.reject(report));
    await expect(
      collectLighthouseReports(stepCallback, errorCallback, lighthouseRunner, {
        ...config,
        runs: 2,
      }),
    ).resolves.toEqual({
      reports: [],
      failed: 2,
    });
    expect(lighthouseRunner).toHaveBeenCalledTimes(2);
    expect(stepCallback).toHaveBeenCalledTimes(2);
    expect(errorCallback).toHaveBeenCalledTimes(2);
  });
});

describe('collectReports', () => {
  test('should work', async () => {
    const config = {
      url: 'url',
      runs: 0,
    };
    const data = {
      reports: [],
      failed: 2,
    };
    const lighthouseReportsCollector = jest.fn(
      async () => await Promise.resolve(data),
    );
    await expect(
      collectReports(lighthouseReportsCollector, config),
    ).resolves.toEqual(
      createReport({
        url: config.url,
        totalRun: config.runs,
        failedRun: data.failed,
        lighthouseReports: data.reports,
      }),
    );
  });
});
