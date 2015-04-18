/*
 * grunt-qunit-junit test harness
 * https://github.com/sbrandwoo/grunt-qunit-junit
 *
 * Copyright (c) 2013 Stephen Brandwood
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var _ = require('underscore'),
        fs = require('fs'),
        path = require('path'),
        JsDiff = require('diff'),

        setupSuite,
        teardownSuite,

        suites = {
            defaults: {
                options: undefined,
                files: ['test/fixtures/many_html/**/*.html'],

                actual: '_build/test-reports',
                expected: 'test/expected/defaults'
            },
            custom_dest: {
                options: {
                    dest: '_build/custom_dest'
                },
                files: ['test/fixtures/many_html/**/*.html'],

                actual: '_build/custom_dest',
                expected: 'test/expected/defaults'
            },
            custom_namers: {
                options: {
                    dest: '_build/custom_file_namer',
                    fileNamer: function (url) {
                        var match = url.match(/fixtures\/many_html\/(.*).html$/);
                        return match[1].replace(/\//g, '.');
                    },
                    classNamer: function (moduleName, url) {
                        var match = url.match(/fixtures\/many_html\/(.*).html$/);
                        return match[1].replace(/\//g, '.');
                    },
                    testNamer: function (testName, moduleName, url) {
                        return (moduleName !== 'global' ? (moduleName + ": ") : "") + testName;
                    }
                },
                files: ['test/fixtures/many_html/**/*.html'],

                actual: '_build/custom_file_namer',
                expected: 'test/expected/custom_file_namer'
            },
            single_html: {
                options: {
                    dest: '_build/single_html',
                    fileNamer: function (url) {
                        var match = url.match(/test=(.*)$/);
                        return match[1].replace(/\//g, '.');
                    }
                },
                urls: _.map(['success', 'empty', 'mixed'], function (x) {
                    return 'http://localhost:8017/fixtures/single_html/'
                            + 'testrunner.html?test=' + x;
                }),

                actual: '_build/single_html',
                expected: 'test/expected/single_html'
            },
            default_filenamer_ignores_querystring: {
                options: {
                    dest: '_build/default_filenamer_ignores_querystring'
                },
                urls: [ 'http://localhost:8017/fixtures/single_html/'
                        + 'testrunner.html?test=success&noGlobals=true' ],
                actual: '_build/default_filenamer_ignores_querystring',
                expected: 'test/expected/default_filenamer_ignores_querystring'
            }
        };

    /**
     * Setup the config for running a test suite.
     * @param  {string} name     name of suite
     * @param  {object} settings settings for suite
     */
    setupSuite = function (name, settings) {
        var qunitConfig = {
                options: {
                    url: settings.urls,
                    force: true
                }
            };
        if (settings.files) {
            qunitConfig.src = settings.files;
        }
        if (settings.urls) {
            qunitConfig.options.urls = settings.urls;
        }
        grunt.log.ok("Performing setup for " + name);
        grunt.config('qunit_junit.options', settings.options);
        grunt.config.set('qunit.all', qunitConfig);
    };

    /**
     * Check the results of a suite after testing.
     * @param  {string} name     name of suite
     * @param  {object} settings settings for suite
     * @param  {array} errors    array to add error messages to
     */
    teardownSuite = function (name, settings, errors) {
        grunt.log.ok("Performing teardown for " + name);
        var actualDir = settings.actual,
            expectedDir = settings.expected,
            expectedFiles = [];

        function extractTimes(str) {
            var regex = /[^s]name="([^"]+)"(.+)time="([^"]+)"/g,
                timesByName = {},
                matches;

            while ((matches = regex.exec(str)) !== null) {
                timesByName[matches[1]] = matches[3];
            }

            return timesByName;
        }

        // Check for the expected
        grunt.file.recurse(expectedDir,
                function (abspath, rootdir, subdir, filename) {
            var actualPath = path.join(actualDir, subdir || "", filename),
                exists = fs.existsSync(actualPath);
            expectedFiles.push(actualPath);

            if (!exists) {
                errors.push('Expected file "' + filename
                    + '" does not exist at "' + actualPath + '"');
                return;
            }

            var actual = grunt.file.read(actualPath),
                expected = grunt.file.read(abspath),
                expectedTimes = extractTimes(actual),
                actualTimes = extractTimes(expected);

            // Remove parts of the stack traces that contain system specific paths
            actual = actual.replace(/[\t ]+(at |file).*\n/g, '');

            // Remove time and compare it separately.
            actual = actual.replace(/ time=".+"/g, '');
            expected = expected.replace(/ time=".+"/g, '');

            if (actual !== expected) {
                var diff = JsDiff.diffLines(expected, actual),
                    s = "Contents of " + filename + " did not match. Diffs:\n";
                diff.forEach(function (part, i) {
                    if (part.removed) {
                        s += part.value.red;
                    } else if (part.added) {
                        s += part.value.green;
                    } else {
                        s += part.value;
                    }
                });
                errors.push(s);
                return;
            }

            Object.keys(expectedTimes).forEach(function (name) {
                var expected = expectedTimes[name],
                    actual = actualTimes[name],
                    tolerance = 0.1,
                    diff = (parseFloat(expected) - parseFloat(actual));

                if (Math.abs(diff) > tolerance) {
                    errors.push("Actual time of " + name + " in " + filename + " differed by "
                        + diff + ", did not fall within expected tolerance.");
                }
            });

            grunt.log.ok(actualPath + " was as expected");
        });

        // Check for the unexpected
        grunt.file.recurse(actualDir,
                function (abspath, rootdir, subdir, filename) {
            var actualPath = path.join(actualDir, subdir || "", filename);
            if (expectedFiles.indexOf(actualPath) < 0) {
                errors.push('Found unexpected file "'
                    + actualPath + '"');
                return;
            }
        });
    };

    /**
     * A very simple task that provides a test harness. This takes the
     * configuration of a task as a function and executes it.
     * Don't call this directly.
     */
    grunt.registerMultiTask('harness', 'Test harness', function () {
        this.data();
    });

    /**
     * The top-level task to be run in order to run the test harness.
     *
     * For each suite, configurations of the harness task are built and added
     * to the run queue. These will setup, run and teardown each suite in turn.
     * Then, the results task is run to report what happened.
     */
    grunt.registerTask('test', 'Test stuff', function () {
        var errors = {};

        // Start up the server that hosts some of the suites
        grunt.task.run('connect:test');

        // Configure the tasks for each test suite
        _.each(suites, function (settings, name) {
            grunt.log.ok("Running test suite: " + name);
            errors[name] = [];

            grunt.config('harness.setup_' + name,
                    _.bind(setupSuite, null, name, settings));
            grunt.config('harness.teardown_' + name,
                    _.bind(teardownSuite, null, name, settings, errors[name]));

            grunt.task.run('harness:setup_' + name, 'qunit_junit', 'qunit:all',
                'harness:teardown_' + name);
        });

        // Configure the summary task
        grunt.config('harness.results', function () {
            var success = true;
            grunt.log.writeln("Test results");
            _.each(suites, function (settings, name) {
                if (errors[name].length === 0) {
                    grunt.log.ok(name + ': Success');
                } else {
                    grunt.log.error(name + ': Failed!');
                    success = false;
                    _.each(errors[name], function (message) {
                        grunt.log.writeln(message);
                    });
                }
            });
            if (!success) {
                grunt.warn("Failed :(");
            }
        });
        grunt.task.run('harness:results');
    });

};