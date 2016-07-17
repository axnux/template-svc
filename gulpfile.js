'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    gulp = require('gulp'),
    _ = require('lodash'),
    plugins = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    testAssets = require('./config/assets/test'),
    defaultAssets = require('./config/assets/default'),
    mergedConfig = require('./config/default');


var changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test';
});

// Make sure upload directory exists
gulp.task('makeUploadsDir', function () {
  return fs.mkdir( mergedConfig.uploads.dest , function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err);
    }
  });
});

// ESLint JS linting task
gulp.task('eslint', function () {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    testAssets.tests.server
  );

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

// Mocha tests task
gulp.task('mocha', function (done) {
  var testSuites = changedTestFiles.length?changedTestFiles:testAssets.tests.server;
  gulp.src(testSuites)
    .pipe(plugins.mocha({
      reporter: 'spec',
      timeout: 10000
    }))
    .on('error', function (err) {
      // console.log(err);
    })
    .on('end', function () {
      done();
    });
});

gulp.task('test:once', function (done) {
  runSequence('env:test', ['eslint', 'makeUploadsDir'], 'mocha', done);
});

gulp.task('watch:test', function () {

  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], ['test:once'])
  .on('change', function (file) {
    changedTestFiles = [];

    // iterate through server test glob patterns
    _.forEach(testAssets.tests.server, function (pattern) {
      // determine if the changed (watched) file is a server test
      _.forEach(glob.sync(pattern), function (f) {
        var filePath = path.resolve(f);

        if (filePath === path.resolve(file.path)) {
          changedTestFiles.push(f);
        }
      });
    });

  });

});

gulp.task('bdd', function (done) {
  runSequence( 'test:once', 'watch:test', done);
});