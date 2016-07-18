'use strict'

var chai = require('chai')
var supertest = require('supertest')
var serverApp = require('./../../server')
var expect = chai.expect

describe('Test Book Consumer', function () {
  var supertestAgent = supertest.agent(serverApp)

  it('should consume a book', function (done) {
    var expectationBlock = function (err, res) {
      if (err) {
        //
      }
      expect(res.body.response).to.equal('read book')
      done()
    }
    supertestAgent.get('/book')
		// .attach('file', './test/fixtures/dummy.png') // if want to upload image
		.expect(200)
		.expect('Content-Type', /text/)
		.end(expectationBlock)
  })
})
