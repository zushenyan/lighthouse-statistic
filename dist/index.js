#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const lighthouse_1 = __importDefault(require("lighthouse"));
const chromeLauncher = __importStar(require("chrome-launcher"));
const ramda_1 = __importDefault(require("ramda"));
const mathjs_1 = require("mathjs");
const bootup_1 = require("./bootup");
const launchChromeAndRunLighthouse = async (url, port) => {
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
        port,
    });
    const results = await lighthouse_1.default(url, {
        port: chrome.port,
        onlyCategories: ['performance'],
    });
    await chrome.kill();
    return results.lhr;
};
(async () => {
    try {
        const config = await bootup_1.processArgv();
        console.log('Load config successfully.');
        const reports = [];
        for (let i = 0; i < config.runs; i++) {
            console.log(`Start running ${i + 1} time(s)...`);
            reports.push(await launchChromeAndRunLighthouse(config.url, config.port));
        }
        console.log('Done running.');
        const auditKindLens = config.audits.map((v) => ramda_1.default.lensPath(['audits', v]));
        const results = auditKindLens.reduce((acc, len, index) => {
            const detailArr = reports.map(ramda_1.default.view(len));
            const numericValueArr = detailArr.map((v) => v.numericValue);
            acc.audits[config.audits[index]] = {
                max: mathjs_1.max(numericValueArr),
                min: mathjs_1.min(numericValueArr),
                avg: mathjs_1.mean(numericValueArr),
                med: mathjs_1.median(numericValueArr),
            };
            return acc;
        }, {
            url: config.url,
            runs: config.runs,
            audits: {},
        });
        console.log(results);
    }
    catch (e) {
        console.log(e.message);
    }
})();
//# sourceMappingURL=index.js.map