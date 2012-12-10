# grunt-qunit-junit

> JUnit compatible XML reporter for QUnit

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

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

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

### Usage Examples

To trigger the XML reporting, simply call the `qunit_junit` task before you call the `qunit` task. A report will be created for all tests run by QUnit.

Typically, you'll use it as part of a list of commands like this:

```js
grunt.registerTask('test', ['connect:server', 'qunit_junit', 'qunit']);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][].

## Release History
_(Nothing yet)_
