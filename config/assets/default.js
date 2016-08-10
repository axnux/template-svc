'use strict'

module.exports = {
  server: {
    gulpConfig: ['gulpfile.js'],
    routes: ['src/*/routes/**/*.js'],
    testSubjectJS: ['src/**/*.js'],
    allJS: ['server.js', 'config/*.js', 'config/**/*.js', 'src/**/*.js']
  }
}
