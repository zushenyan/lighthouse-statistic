import {
  validateWithStrictAndCast,
  readJson,
  writeOutputs,
  createFiles,
  runBenchmark,
  OutputWriterArgs,
} from './internal';

describe('validateWithStrictAndCast', () => {
  test('should work', async () => {
    const data = { url: 'url', runs: 1 };
    await expect(validateWithStrictAndCast(data)).resolves.not.toThrow();
  });

  test('should throw', async () => {
    const data = { url: 'url', runs: 1, foo: 'foo' };
    await expect(validateWithStrictAndCast(data)).rejects.toThrow();
  });
});

describe('readJson', () => {
  test('should work', async () => {
    const fileReader = jest.fn(
      async () => await Promise.resolve(Buffer.from('aaa')),
    );
    const jsonParser = jest.fn(() => 'bbb');
    const debugLogger = jest.fn();
    const errorHandler = jest.fn();
    await expect(
      readJson(fileReader, jsonParser, debugLogger, errorHandler, 'filePath'),
    ).resolves.toEqual('bbb');
    expect(fileReader).toHaveBeenCalledTimes(1);
    expect(jsonParser).toHaveBeenCalledTimes(1);
    expect(debugLogger).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledTimes(0);
  });
  test('should throw', async () => {
    const fileReader = jest.fn(
      async () => await Promise.reject(Buffer.from('aaa')),
    );
    const jsonParser = jest.fn(() => 'bbb');
    const debugLogger = jest.fn();
    const errorHandler = jest.fn();
    await expect(
      readJson(fileReader, jsonParser, debugLogger, errorHandler, 'filePath'),
    ).resolves.not.toThrow();
    expect(fileReader).toHaveBeenCalledTimes(1);
    expect(jsonParser).toHaveBeenCalledTimes(0);
    expect(debugLogger).toHaveBeenCalledTimes(0);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });
});

describe('writeOutputs', () => {
  test('should work', async () => {
    const dirMaker = jest.fn(async () => await Promise.resolve('aaa'));
    const fileWriter = jest.fn(async () => await Promise.resolve());
    const spinner = {
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn(),
    };
    const errorHandler = jest.fn();
    await expect(
      writeOutputs(
        dirMaker,
        fileWriter,
        // pass mocking the whole Ora type.
        // @ts-expect-error
        spinner,
        errorHandler,
        'directoryPath',
        [[], []],
      ),
    ).resolves.not.toThrow();
    expect(dirMaker).toHaveBeenCalledTimes(1);
    expect(fileWriter).toHaveBeenCalledTimes(2);
    expect(spinner.start).toHaveBeenCalledTimes(1);
    expect(spinner.succeed).toHaveBeenCalledTimes(1);
    expect(spinner.fail).toHaveBeenCalledTimes(0);
    expect(errorHandler).toHaveBeenCalledTimes(0);
  });
  test('should throw', async () => {
    const dirMaker = jest.fn(async () => await Promise.reject());
    const fileWriter = jest.fn(async () => await Promise.resolve());
    const spinner = {
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn(),
    };
    const errorHandler = jest.fn();
    await expect(
      writeOutputs(
        dirMaker,
        fileWriter,
        // pass mocking the whole Ora type.
        // @ts-expect-error
        spinner,
        errorHandler,
        'directoryPath',
        [[], []],
      ),
    ).resolves.not.toThrow();
    expect(dirMaker).toHaveBeenCalledTimes(1);
    expect(fileWriter).toHaveBeenCalledTimes(0);
    expect(spinner.start).toHaveBeenCalledTimes(1);
    expect(spinner.succeed).toHaveBeenCalledTimes(0);
    expect(spinner.fail).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });
});

describe('createFiles', () => {
  test('should work', () => {
    const rawData = new Uint8Array(Buffer.from('bbb'));
    const pathResolver = jest.fn(() => 'aaa');
    const transformer = jest.fn(() => rawData);
    const config = {
      url: 'url',
      runs: 1,
      output: {
        basePath: 'basePath',
        directoryName: 'directoryName',
        reportsFilename: 'reportsFilename',
        statisticFilename: 'statisticFilename',
      },
    };
    const report = {
      lighthouseReports: [],
      statistic: {
        url: config.url,
        runs: {
          total: config.runs,
          failed: 0,
        },
        audits: {},
      },
    };
    expect(createFiles(pathResolver, transformer, config, report)).toEqual([
      'aaa',
      [
        ['aaa', rawData],
        ['aaa', rawData],
      ],
    ]);
  });
});

describe('runBenchmark', () => {
  test('should work', async () => {
    const config = {
      url: 'url',
      runs: 1,
    };
    const report = {
      lighthouseReports: [],
      statistic: {
        url: config.url,
        runs: {
          total: config.runs,
          failed: 0,
        },
        audits: {},
      },
    };
    const filesArgs: OutputWriterArgs = [
      'directoryPath',
      [
        ['aaa', new Uint8Array()],
        ['bbb', new Uint8Array()],
      ],
    ];
    const validator = jest.fn(async () => await Promise.resolve(config));
    const debugLogger = jest.fn();
    const collector = jest.fn(async () => await Promise.resolve(report));
    const outputWriter = jest.fn(async () => await Promise.resolve());
    const fileCreator = jest.fn(() => filesArgs);
    const spinner = {
      start: jest.fn(),
      succeed: jest.fn(),
    };
    const args = {};
    await expect(
      runBenchmark(
        validator,
        debugLogger,
        collector,
        outputWriter,
        fileCreator,
        // pass mocking the whole Ora type.
        // @ts-expect-error
        spinner,
        args,
      ),
    ).resolves.not.toThrow();
    expect(validator).toHaveBeenCalledTimes(1);
    expect(debugLogger).toHaveBeenCalledTimes(2);
    expect(collector).toHaveBeenCalledTimes(1);
    expect(outputWriter).toHaveBeenCalledTimes(1);
    expect(fileCreator).toHaveBeenCalledTimes(1);
    expect(spinner.start).toHaveBeenCalledTimes(1);
    expect(spinner.succeed).toHaveBeenCalledTimes(1);
  });
});
