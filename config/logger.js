'use strict'

var winston = require('winston')
var lodash = require('lodash')
var DailyRotateFile = require('winston-daily-rotate-file')

module.exports.setup = function () {
  // set syslog levels
  winston.setLevels(winston.config.syslog.levels)
  var standardLogger = {
    transports: []
  }

  switch (process.env.NODE_ENV) {
    case 'test':
      standardLogger.transports.push(new (winston.transports.Console)({
        timestamp: true,
        level: 'error',
        colorize: true,
        prettyPrint: true,
        humanReadableUnhandledException: true,
        formatter: function (options) {
          return options.message
        }
      }))
      break
    case 'production':
      standardLogger.transports.push(new (winston.transports.Console)({
        timestamp: true,
        level: 'crit',
        colorize: false,
        prettyPrint: true,
        humanReadableUnhandledException: true
      }))
      standardLogger.transports.push(new (DailyRotateFile)({
        timestamp: true,
        level: 'info',
        filename: 'logs/app.log',
        datePattern: '-yyyy-MM-dd',
        logstash: true, // json
        humanReadableUnhandledException: false
      }))
      break
    case 'development':
    default:
      standardLogger.transports.push(new (winston.transports.Console)({
        timestamp: true,
        level: 'debug',
        colorize: true,
        prettyPrint: true,
        humanReadableUnhandledException: true
      }))
  }

  winston.loggers.add('standard', standardLogger)
  winston.loggers.get('standard').exitOnError = true
  winston.handleExceptions(new (DailyRotateFile)({
    timestamp: true,
    level: 'debug',
    filename: 'logs/exception.log',
    datePattern: '-yyyy-MM-dd',
    logstash: true, // json
    humanReadableUnhandledException: true,
    handleExceptions: true
  }))
}

module.exports.prepareFilter = function (appName) {
  var sanitizeAppName = lodash.snakeCase(appName)
  winston.loggers.get('standard').rewriters.push(function (level, msg, meta) {
    meta.timestamp = new Date().toISOString()
    return meta
  })
  winston.loggers.get('standard').filters.push(function (level, msg, meta) {
    return `[${sanitizeAppName}] ${meta.timestamp} [${level}] ${msg}`
  })
}
