'use strict';

var config = require('./default'),
  express = require('./express-config');



module.exports.start = function() {
  
  var app = express.init();

  app.listen(config.port, config.host, function () {
    var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
    console.log('--');
    console.log('Environment:     ' + process.env.NODE_ENV);
    console.log('Server:          ' + server);
    console.log('--');
  });

};
