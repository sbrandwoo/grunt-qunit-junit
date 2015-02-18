/*
 * grunt-qunit-junit
 * https://github.com/sbrandwoo/grunt-qunit-junit
 *
 * Copyright (c) 2013 Stephen Brandwood
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.loadTasks('tasks');
    grunt.loadTasks('test/tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-connect');

    var _ = require('underscore'),
        path = require('path'),
        fs = require('fs');

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                'lib/*.js',
                'test/tasks/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            all: ['_build']
        },

        connect: {
            test: {
                options: {
                    port: 8017,
                    base: 'test'
                }
            }
        }

    });

    // By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'jshint', 'test']);

};
