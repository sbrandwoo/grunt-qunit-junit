/*
 * grunt-qunit-junit
 * https://github.com/sbrandwoo/grunt-qunit-junit
 *
 * Copyright (c) 2012 Stephen Brandwood
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore'),

    // Force tests to report a duration > 0.01 seconds.
    minimumTestDurationMs = (0.01 * 1000);

function XmlReporter(options) {
    this.classNamer = options.classNamer;
}

_.extend(XmlReporter.prototype, {
    escape: function (value) {
        return value.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    sumTestsuiteDuration: function (tests) {
        return _.reduce(tests, function (soFar, test) {
            return soFar + Math.max(test.duration, minimumTestDurationMs);
        }, 0);
    },

    formatDuration: function (ms) {
        return (isFinite(ms) && ms > minimumTestDurationMs) ? (ms / 1000).toFixed(2) : "0.01";
    },
    
    formatTestSuiteName: function (url, module) {
        var className = this.classNamer.call(null, url, module.name);
        return this.escape(className);
    },
    
    formatTestcaseClassname: function (url, module) {
        return this.formatTestSuiteName(url, module);
    },

    generateReport: function (result) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n',
            suiteDuration;
        _.each(result.modules, function (module) {
            suiteDuration = this.sumTestsuiteDuration(module.tests);
            xml += '\t<testsuite'
                + ' name="' + this.formatTestSuiteName(result.url, module) + '"'
                + ' errors="' + module.errored + '"'
                + ' failures="' + module.failed + '"'
                + ' tests="' + module.tests.length + '"'
                + ' time="' + this.formatDuration(suiteDuration) + '">\n';
            _.each(module.tests, function (test) {
                xml += '\t\t<testcase'
                    + ' classname="' + this.formatTestcaseClassname(result.url, module) + '"'
                    + ' name="' + this.escape(
                        (module.name ? (module.name + ": ") : "") + test.name) + '"'
                    + ' assertions="' + test.total + '"'
                    + ' time="' + this.formatDuration(test.duration) + '">\n';
                _.each(test.logs, function (data) {
                    xml += '\t\t\t<' + data.type + ' type="failed" message="'
                        + this.escape(data.message) + '">\n';
                    if (data.stack) {
                        xml += '\t' + this.escape(data.stack) + '\n';
                    }
                    if (data.source){
                        xml += '\t' + this.escape(data.source) + '\n';
                    }
                    xml += '\t\t\t</' + data.type + '>\n';
                }, this);
                xml += "\t\t</testcase>\n";
            }, this);
            xml += "\t</testsuite>\n";
        }, this);
        xml += "</testsuites>\n";

        return xml;
    },

    generateTimeout: function (result) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n',
            moduleName = "global";

        xml += '\t<testsuite'
            + ' name="' + this.formatTestSuiteName(result.url, moduleName) + '"'
            + ' errors="1"'
            + ' failures="0"'
            + ' tests="1"'
            + ' time="0.01">\n';
        xml += '\t\t<testcase'
            + ' classname="' + this.formatTestcaseClassname(result.url, moduleName) + '"'
            + ' name="main"'
            + ' assertions="1"'
            + ' time="0.01">\n';
        xml += '\t\t\t<error type="timeout" message="Test timed out, '
            + 'possibly due to a missing QUnit.start() call."></error>\n';
        xml += "\t\t</testcase>\n";
        xml += "\t</testsuite>\n";
        xml += "</testsuites>\n";

        return xml;
    }
});

module.exports = XmlReporter;
