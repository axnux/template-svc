'use strict'

var config = require('./default')
var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

module.exports.initMiddleware = function (app) {
  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())
  app.use(methodOverride())
}

module.exports.initModulesServerRoutes = function (app) {
  config.files.server.routes.forEach(function (routePath) {
    require(path.resolve(routePath))(app)
  })
}

module.exports.init = function () {
  // Initialize express app
  var app = express()
  this.initMiddleware(app)
  this.initModulesServerRoutes(app)

  return app
}
