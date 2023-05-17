
/*
 * Default configuration.
 */

module.exports = {
  serviceName: 'myqa-backend',
  server: {
    domain: null,
    port: 7100
  },
  cors: {
    socketConnectionOrigin: 'http://localhost:1234'
  },
  logger: {
    datePattern: 'YYYY-MM-DD',
    format: 'text',
    level: 'debug',
    maxFiles: '30d',
    maxSize: '20m',
    zippedArchive: 'false'
  },
  authentication: {
    signingKey: null,
    expirationTime: '1h',
    secureCookies: true
  },
  intelligenceService: {
    url: 'http://localhost:7000'
  },
  resources: {
    maxFileSize: 1024 * 1024 * 10 // 10MB
  }
}
