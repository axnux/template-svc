'use strict';

module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  uploads: {
    dest: process.env.PORT || './tmp/upload',
    image: {
      dest: 'img/',
    },
    video: {
      dest: 'vid/',
    }
  }
};