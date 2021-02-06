const {cleanTaskRunner} = require('./taskRunners/cleanTaskRunner.js');
const {copyAssetsRunner} = require('./taskRunners/copyAssetsRunner.js');
const {buildAggregatedJSONTaskRunner} = require('./taskRunners/buildAggregatedJSONTaskRunner.js');
const {buildMarkdownTaskRunner} = require('./taskRunners/buildMarkdownTaskRunner.js');
const {buildHTMLTaskRunner} = require('./taskRunners/buildHTMLTaskRunner.js');

exports.runners = {
    cleanTaskRunner,
    copyAssetsRunner,
    buildAggregatedJSONTaskRunner,
    buildMarkdownTaskRunner,
    buildHTMLTaskRunner
};
