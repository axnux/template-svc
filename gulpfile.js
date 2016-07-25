'use strict'

var path = require('path')
var glob = require('glob')
var gulp = require('gulp')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var plugins = require('gulp-load-plugins')()
var runSequence = require('run-sequence')
var testAssets = require('./config/assets/test')
var defaultAssets = require('./config/assets/default')
var mergedConfig = require('./config/default')

var changedTestFiles = []

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test'
})

// Make sure upload directory exists
gulp.task('makeUploadsDir', function () {
  mkdirp(mergedConfig.uploads.dest, function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err)
    }
  })
  mkdirp(mergedConfig.uploads.dest + mergedConfig.uploads.image.dest, function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err)
    }
  })
  mkdirp(mergedConfig.uploads.dest + mergedConfig.uploads.video.dest, function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err)
    }
  })
})

// ESLint JS linting task
gulp.task('eslint', function () {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    testAssets.tests.server
  )

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
})

// prepare mocha code coverage
gulp.task('prepare-mocha', function (done) {
  return gulp.src(defaultAssets.server.testSubjectJS)
    .pipe(plugins.istanbul())
    .pipe(plugins.istanbul.hookRequire())
})

// Mocha tests task
gulp.task('mocha', ['prepare-mocha'], function (done) {
  var testSuites = testAssets.tests.server
  gulp.src(testSuites)
    .pipe(plugins.mocha({
      reporter: 'spec',
      timeout: 10000
    }))
    .pipe(plugins.istanbul.writeReports())
    .on('error', function () {
      //
    })
    .on('end', function () {
      done()
    })
})

gulp.task('test:once', function (done) {
  runSequence('env:test', ['eslint', 'makeUploadsDir'], 'mocha', done)
})

// For bdd
gulp.task('mocha:live', function (done) {
  var testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server
  gulp.src(testSuites)
    .pipe(plugins.mocha({
      reporter: 'spec',
      timeout: 3000
    }))
    .on('error', function () {
      //
    })
    .on('end', function () {
      done()
    })
})

gulp.task('run:test', function (done) {
  runSequence('makeUploadsDir', 'mocha:live', done)
})

gulp.task('watch:test', function () {
  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], ['run:test'])
  .on('change', function (file) {
    changedTestFiles = []

    // iterate through server test glob patterns
    _.forEach(testAssets.tests.server, function (pattern) {
      // determine if the changed (watched) file is a server test
      _.forEach(glob.sync(pattern), function (f) {
        var filePath = path.resolve(f)

        if (filePath === path.resolve(file.path)) {
          changedTestFiles.push(f)
        }
      })
    })
  })
})

gulp.task('bdd', function (done) {
  runSequence('run:test', 'watch:test', done)
})
