'use strict';


exports.read = function(){
  return 'read book';
}

exports.write = function(title, callback){
  callback('write "' + title + '"');
}
