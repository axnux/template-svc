'use strict'

var book = require('./../book')
var winston = require('winston').loggers.get('standard')

module.exports = function (app) {
  app.route('/book').get(function (req, res) {
    // { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
    winston.info('request book', {
      // meta data
      hello: 'world'
    })
    res.status(200)
    .send({response: book.read()})
    .end()
  })
}
