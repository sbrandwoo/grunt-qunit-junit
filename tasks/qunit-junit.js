/*
 * grunt-qunit-junit
 * https://github.com/sbrandwoo/grunt-qunit-junit
 *
 * Copyright (c) 2012 Stephen Brandwood
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var _ = require('underscore'),
        path = require('path'),
        XmlReporter = require('../lib/XmlReporter'),

        Runner,
        current;

    Runner = function (options) {
        this.options = options;

        this.reporter = new XmlReporter(options);
        this.url = "";
        this.modules = [];
        this.tests = [];
        this.currentLogs = [];
        this.currentErrors = 0;

        // Event binding targets with correct `this` context
        this.bindTargets = _.map([
            ['qunit.spawn', this.handleSpawn],
            ['qunit.begin', this.handleBegin],
            ['qunit.moduleStart', this.handleModuleStart],
            ['qunit.testStart', this.handleTestStart],
            ['qunit.log', this.handleLog],
            ['qunit.testDone', this.handleTestDone],
            ['qunit.moduleDone', this.handleModuleDone],
            ['qunit.done', this.handleDone],
            ['qunit.fail.timeout', this.handleTimeout]
        ], function (a) {
            // Use _.bind to add the `this` context to the event callback
            return [a[0], _.bind(a[1], this)];
        }, this);
    };
    _.extend(Runner.prototype, {

        /**
         * Attach event listeners for qunit events.
         * @param  {EventEmitter} emitter  emitter of the qunit events
         */
        attach: function (emitter) {
            _.each(this.bindTargets, function (a) {
                emitter.on(a[0], a[1]);
            });
        },

        /**
         * Remove any existing attached event listeners.
         * @param  {EventEmitter} emitter  emitter of the qunit events
         */
        detach: function (emitter) {
            _.each(this.bindTargets, function (a) {
                emitter.off(a[0], a[1]);
            });
        },

        handleSpawn: function (url) {
            this.url = url;
        },

        handleBegin: function () {
        },

        handleModuleStart: function (name) {
            if (this.tests.length) {
                // TODO: Investigate the various routes to this spot
                grunt.log.error("Unexpected handleModuleStart when we had tests already recorded");
            }
        },

        handleTestStart: function (name) {
            this.currentLogs = [];
            this.currentErrors = 0;
        },

        handleLog: function (result, actual, expected, rawMessage, source) {
            var match,
                message = rawMessage || "Test failed",
                stack = null,
                type = "failure";
            if (!result) {
                if (rawMessage) {
                    // Detect script errors and parse out the meaningful bits
                    match = rawMessage.match(/(Died on test #[0-9]+)[\ \t]+([\s\S]*)[0-9]+:\ (.*)/);
                    if (match) {
                        message = match[1] + ": " + match[3];
                        stack = match[2];
                        type = "error";
                        this.currentErrors += 1;
                    }
                }
                this.currentLogs.push({
                    actual: actual,
                    expected: expected,
                    message: message,
                    stack: stack,
                    source:source,
                    type: type
                });
            }
        },

        handleTestDone: function (name, failed, passed, total, duration) {
            this.tests.push({
                name: name,
                errored: this.currentErrors,
                failed: failed - this.currentErrors,
                passed: passed,
                total: total,
                duration: duration,
                logs: this.currentLogs
            });

            this.currentLogs = null;
            this.currentErrors = 0;
        },

        handleModuleDone: function (name, failed, passed, total) {
            var totalErrors = 0;
            this.tests.forEach(function (test) {
                totalErrors += test.errored;
            });
            var data = {
                name: name,
                errored: totalErrors,
                failed: failed - totalErrors,
                passed: passed,
                total: total,
                tests: this.tests
            };
            this.modules.push(data);

            this.tests = [];
        },

        handleDone: function (failed, passed, total, runtime) {
            var filename = 'TEST-' + this.options.fileNamer.call(null, this.url) + '.xml',
                filePath = path.join(this.options.dest, filename),
                report;

            if (this.tests.length) {
                // Must have been no modules
                this.handleModuleDone('main', failed, passed, total);
            }

            report = this.reporter.generateReport({
                url: this.url,
                failed: failed,
                passed: passed,
                total: total,
                modules: this.modules,
                errored: this.errored,
                tests: this.tests
            });

            grunt.log.debug("Writing results to " + filePath);
            grunt.file.write(filePath, report);

            this.url = null;
            this.modules = [];
        },

        handleTimeout: function () {
            var filename = 'TEST-' + this.options.fileNamer.call(null, this.url) + '.xml',
                filePath = path.join(this.options.dest, filename),
                report;

            report = this.reporter.generateTimeout({
                url: this.url
            });

            grunt.log.debug("Writing timeout report to " + filePath);
            grunt.file.write(filePath, report);
        }
    });


    grunt.registerTask('qunit_junit',
            'Log JUnit style XML reports for QUnit tests', function () {
        var options = this.options({
                dest: '_build/test-reports',
                fileNamer: function (url) {
                    return path.basename(url).replace(/\.html(.*)$/, '');
                },
                classNamer: function (moduleName, url) {
                    return moduleName.replace(/[\\|\/]/g, '.').replace(/\s+/g, '_');
                },
                testNamer: function (testName, moduleName, url) {
                    return testName;
                }
            });

        if (current) {
            grunt.log.ok("Detaching existing reporter");
            current.detach(grunt.event);
        }
        current = new Runner(options);
        current.attach(grunt.event);
        grunt.log.ok("XML reports will be written to " + options.dest);
    });
};
