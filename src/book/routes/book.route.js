'use strict'

var book = require('./../book')

module.exports = function (app) {
  app.route('/book').get(function (req, res) {
    // console.log('hello\n')
    res.status(200)
    .send({response: book.read()})
    .end()
  })
}
