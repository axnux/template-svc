'use strict'

module.exports = {
  appName: 'template-svc',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    region: process.env.S3_REGION || ''
  },
  uploads: {
    s3Bucket: process.env.S3_BUCKET || '',
    dest: process.env.UPLOAD_DIR || './tmp/upload',
    image: {
      dest: '/img'
    },
    video: {
      dest: '/vid'
    }
  }
}
