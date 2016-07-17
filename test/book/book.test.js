'use strict';

var book = require('./../../src/book/book');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));

describe("Test Book", function(){

  it("should be read by someone", function(done){
    expect(book.read()).to.equal('read book');
    done();
  });

  it("should be read by me and somebody");

  it("should be writing book title", function(done){
    var cb = sinon.spy();
    book.write('Zero to one', cb);
    expect(cb).to.have.been.calledWith('write "Zero to one"');
    done();
  });

});
