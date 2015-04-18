# grunt-qunit-junit [![Build Status](https://travis-ci.org/sbrandwoo/grunt-qunit-junit.svg?branch=master)](https://travis-ci.org/sbrandwoo/grunt-qunit-junit)

> JUnit compatible XML reporter for QUnit

This plugin produces XML reports for all QUnit tests that you run with grunt. The XML reports match those created by JUnit and are perfect for loading into Jenkins.

This plugin only works with grunt 0.4.x. If you are using 0.3.x, then I recommend the [grunt-junit plugin](https://github.com/johnbender/grunt-junit).


## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-qunit-junit --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-qunit-junit');
```

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task, `qunit_junit`. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html

## The "qunit_junit" task

### Overview
In your project's Gruntfile, add a section named `qunit_junit` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({

    qunit_junit: {
        options: {
            // Task-specific options go here.
        }
    },
})
```

### Options

#### options.dest
Type: `String`
Default value: `'_build/test-reports'`

Specify where the XML reports should be saved to.

#### options.fileNamer
Type: `Function`
Default value: `function (url) { return path.basename(url).replace(/\.html(.*)$/, ''); }`

Specify a function that converts test URLs into destination filenames.  Note that filenames are automatically prefixed with 'TEST-' and given a '.xml' extension.  The default implementation uses the name of the HTML test-runner, discarding the query string.

#### options.classNamer
Type `Function`
Default value: `function (moduleName, url) { return moduleName.replace(/[\\|\/]/g, '.').replace(/\s+/g, '_'); }`

Specify a function that converts the supplied module name and URL into the value used in the report's 'classname' attribute.  Note that if the test did not belong to a module, the string `'global'` will be passed.  In order to be compliant, the function should ensure that the resulting value represents full classpaths as you might see in Java, such as `my.example.package.someFile` or `com.example.coolthings.Sorter`; the main restriction is that folders or packages must be separated by dots. These enable tools such as Jenkins to group the tests and provide an interface to drill down into the results.

#### options.testNamer
Type: `Function`
Default value: `function (testName, moduleName, url) { return testName; }`

Specify a function that converts the supplied test name, module name and URL into the value used in the report's 'name' attribute. Note that if the test did not belong to a module, the string `'global'` will be passed.

### Usage Examples

To trigger the XML reporting, simply call the `qunit_junit` task **before** you call the `qunit` task. A report will be created for all tests run by QUnit.

Typically, you'll use it as part of a list of commands like this:

```js
grunt.registerTask('test', ['connect:server', 'qunit_junit', 'qunit']);
```

If you call the `qunit_junit` task again, then the existing reporter will be detached and the new one will report in its place.

## Example reports

The following report is an example of a test class that was composed of 3 tests, one of which had a failure.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="example.package.TestClass" errors="1" failures="1" tests="3" time="0.04">
    <testcase classname="example.package.TestClass" name="First test" assertions="1" time="0.01">
    </testcase>
    <testcase classname="example.package.TestClass" name="Second test" assertions="2" time="0.02">
    </testcase>
    <testcase classname="example.package.TestClass" name="Third test" assertions="2" time="0.01">
      <error type="failed" message="Died on test #1: Can't find variable: other">
    at http://localhost:8000/vendor/qunit-1.12.0.js:425
    at http://localhost:8000/test/example/package/TestClass.test.js:29
      </error>
      <failure type="failed" message="Expected 2 assertions, but 1 were run">
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```

Additionally, if a test run fails completely a report of the following form will be generated:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="example.AnotherClass" errors="1" failures="0" tests="1">
    <testcase classname="example.AnotherClass" name="main" assertions="1">
      <error type="timeout" message="Test timed out, possibly due to a missing QUnit.start() call."></error>
    </testcase>
  </testsuite>
</testsuites>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][].

## Release History

* 0.3.0 added ability to provide custom url, module and test namers.
* 0.2.0 updated `grunt-contrib-qunit` to 0.5.2 to report actual test durations.
* 0.1.1 added time attribute to output with dummy value, to aid compatibility
* 0.1.0 is available for general use.

