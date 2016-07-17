'use strict'

var _ = require('lodash')
var glob = require('glob')
var path = require('path')

/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function (globPatterns, excludes) {
  // URL paths regex
  var urlRegex = new RegExp(/^(?:[a-z]+:)?\/\//, 'i')

  // The output array
  var output = []

  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
  if (_.isArray(globPatterns)) {
    globPatterns.forEach(function (globPattern) {
      output = _.union(output, getGlobbedPaths(globPattern, excludes))
    })
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns)
    } else {
      var files = glob.sync(globPatterns)
      if (excludes) {
        files = files.map(function (file) {
          if (_.isArray(excludes)) {
            for (var i in excludes) {
              if (excludes.hasOwnProperty(i)) {
                file = file.replace(excludes[i], '')
              }
            }
          } else {
            file = file.replace(excludes, '')
          }
          return file
        })
      }
      output = _.union(output, files)
    }
  }

  return output
}

/**
 * Validate NODE_ENV existence
 */
var validateEnvironmentVariable = function () {
  var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js')
  if (!environmentFiles.length) {
    process.env.NODE_ENV = 'development'
  }
}

/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function (config, assets) {
  // Appending files
  config.files = {
    server: {}
  }

  config.files.server = getGlobbedPaths(assets.server.allJS)
  config.files.server.routes = getGlobbedPaths(assets.server.routes)
}

/**
 * Initialize global configuration
 */
var initGlobalConfig = function () {
  // Validate NODE_ENV existence
  validateEnvironmentVariable()

  var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'))
  var environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {}
  var assets = _.merge(defaultAssets, environmentAssets)

  // Get the default config
  var defaultConfig = require(path.join(process.cwd(), 'config/env/default'))
  var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {}
  var config = _.merge(defaultConfig, environmentConfig)

  // Initialize global globbed files
  initGlobalConfigFiles(config, assets)

  // Expose configuration utilities
  config.utils = {
    getGlobbedPaths: getGlobbedPaths
  }

  return config
}

/**
 * Set configuration object
 */
module.exports = initGlobalConfig()
