'use strict'

var path = require('path')
var glob = require('glob')
var gulp = require('gulp')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var plugins = require('gulp-load-plugins')()
var runSequence = require('run-sequence')
var args = require('yargs').argv

var changedTestFiles = []
var testAssets = {}
var defaultAssets = {}
var mergedConfig = {}

gulp.task('load:config', function () {
  testAssets = require('./config/assets/test')
  defaultAssets = require('./config/assets/default')
  mergedConfig = require('./config/default')
})

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test'
})

gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development'
})

gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production'
})

// Make sure upload directory exists
gulp.task('make-uploads-dir', function () {
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

gulp.task('nodemon', args.debug ? ['node-inspector'] : null, function () {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: [args.debug ? '--debug' : ''],
    ext: 'js',
    verbose: true,
    watch: _.union(defaultAssets.server.allJS, defaultAssets.server.gulpConfig)
  })
})

gulp.task('node-inspector', function () {
  gulp.src([])
    .pipe(plugins.nodeInspector({
      debugPort: 5858,
      webHost: '0.0.0.0',
      webPort: 1337,
      saveLiveEdit: true,
      preload: false,
      inject: true,
      hidden: [/.wercker/i, /docs/i, /node_modules/i],
      stackTraceLimit: 50
    }))
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

  console.log('run test on files')
  console.log(testSuites)

  var istanbulOpts = {
    dir: './docs/test_coverage',
    reporters: ['lcov', 'text', 'text-summary']
  }

  gulp.src(testSuites)
    .pipe(plugins.mocha({
      reporter: 'spec',
      timeout: 10000
    }))
    .pipe(plugins.istanbul.writeReports(istanbulOpts))
    .on('error', function () {
      console.log('Unable to run mocha test')
    })
    .on('end', function () {
      done()
    })
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
      console.log('Unable to run mocha test continuously')
    })
    .on('end', function () {
      done()
    })
})

gulp.task('test:marathon', function (done) {
  runSequence('make-uploads-dir', 'mocha:live', done)
})

gulp.task('watch:test', function () {
  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], ['test:marathon'])
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

// external interface
gulp.task('test:once', function (done) {
  runSequence('env:test', 'load:config', ['eslint', 'make-uploads-dir'], 'mocha', done)
})

gulp.task('bdd', function (done) {
  runSequence('env:test', 'load:config', ['test:marathon'], 'watch:test', done)
})

gulp.task('dev', function (done) {
  runSequence('env:dev', 'load:config', ['eslint', 'make-uploads-dir'], 'nodemon', done)
})

gulp.task('start', function (done) {
  runSequence('load:config', ['eslint', 'make-uploads-dir'], 'nodemon', done)
})

gulp.task('release:build', function (done) {
  runSequence('env:prod', 'load:config', 'make-uploads-dir', done)
})
