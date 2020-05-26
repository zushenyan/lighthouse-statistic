# About

A CLI tool for automatically running lighthouse and calculate the statistics for you.

# Installation

```bash
# yarn
yarn global add @andrewyan/lighthouse-statistic
# npm
npm install -g @andrewyan/lighthouse-statistic
```

# How To Run

For detail information please run

```bash
lighthouse-statistic --help
```

## Quick Run

```bash
lighthouse-statistic [url]
# for example, benchmark http://google.com for 3 times
# lighthouse-statistic start http://google.com --runs=3
```

By default, it will create a folder named with ISO time. The folder structure looks like below:

```
2020-05-26T12:16:12.397Z
|- lighthouse-reports.json
|- statistic.json
```

- `lighthouse-reports.json` This file contains the raw data of lighthouse report.
- `statistic.json` This file is the statistic. This roughly looks like below:

```json
{
  "url": "http://google.com",
  "runs": { "total": 3, "failed": 0 },
  "audits": {
    "first-contentful-paint": {
      "score": { "max": 0.93, "min": 0.91, "avg": 0.92, "med": 0.92 },
      "numericValue": {
        "max": 2268.7129999999997,
        "min": 2153.795,
        "avg": 2217.827333333333,
        "med": 2230.974
      }
    }
    //...
  }
}
```

By default it will only audit the `performance` category of lighthouse.

## Custom Config

If you need to benchmark with different settings, please consider using this command:

```bash
lighthouse-statistic config [path-to-config]
# for example
# lighthouse-statistic config ./my-lighthouse.json
```

Assuming you want to audit particular items and have a custom output files:

```json
{
  "url": "http://google.com",
  "runs": 2,
  "output": {
    "basePath": "./output-test",
    "directoryName": "my-custom-directory",
    "reportsFilename": "my-reports.json",
    "statisticFilename": "my-statistic.json"
  },
  "chrome": {
    "chromeFlags": ["--headless"]
  },
  "lighthouse": {
    "flags": {
      "onlyAudits": [
        "first-meaningful-paint",
        "first-contentful-paint",
        "first-cpu-idle",
        "time-to-first-byte"
      ]
    }
  }
}
```

This will run lighthouse audit as you desired and generate files below:

```
output-test
|- my-custom-directory
   |- my-reports.json
   |- my-statistic.json
```

For what you can pass to `chrome` and `lighthouse` fields, please reference links below:

- [`core/schemas/chrome`](https://github.com/zushenyan/lighthouse-statistic/blob/master/src/core/schemas/chrome.ts)
- [`core/schemas/lighthouse`](https://github.com/zushenyan/lighthouse-statistic/blob/master/src/core/schemas/lighthouse.ts)
- [chrome-launcher official documents](https://github.com/GoogleChrome/chrome-launcher#launchopts)
- [lighthouse official documents](https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically)

# Using it Programmatically

## Installation

```bash
yarn add @andrewyan/lighthouse-statistic
# or
npm install @andrewyan/lighthouse-statistic
```

> There is no need to install `@types` as it is already powered by typescript, however, there are some issue while typing [Ramda](https://github.com/ramda/ramda)'s curry method. Typescript will return unexpected types like `any` for some functions.

## Access to Package

```js
// node
const { startCollecting } = require('@andrewyan/lighthouse-statistic');
// typescript
import { startCollecting } from '@andrewyan/lighthouse-statistic';

(async () => {
  const config = {
    url: 'http://google.com',
    runs: 2,
  };
  const options = {
    stepCallback: (index, config) =>
      console.log(`Running ${index}/${config.runs} times...`),
    errorCallback: (index, failed, config) =>
      console.log(`Failed ${failed} times while performing ${index} run.`),
  };
  const report = await startCollecting(options, config);
  console.log(report);
})();
```

The `report` will look like this:

```js
{
  lighthouseReports: [/* results from each lighthouse benchmark */],
  statistic: [
    url: 'http://google.com',
    runs: {
      total: 2,
      failed: 0
    },
    audits: {/* key to audit items */}
  ]
}
```
