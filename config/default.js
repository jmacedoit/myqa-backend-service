
/*
 * Default configuration.
 */

module.exports = {
  api: {
    prefix: '/api'
  },
  publicUri: 'http://localhost:1234',
  datasource: {
    host: 'localhost',
    port: 3406,
    username: 'root',
    password: 'password',
    database: 'myqa_general'
  },
  serviceName: 'myqa-backend',
  server: {
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
    expirationTime: '168h',
    secureCookies: true
  },
  intelligenceService: {
    url: 'http://localhost:7000'
  },
  resources: {
    maxFileSize: 1024 * 1024 * 10 // 10MB
  },
  emailVerification: {
    tokenTtl: 60 * 60 * 24 * 2,
    route: '/app/email-verification'
  },
  passwordReset: {
    tokenTtl: 60 * 60 * 24 * 2,
    route: '/app/reset-password'
  },
  sendgrid: {
    apiKey: null,
    senderName: 'Myqa',
    senderEmail: 'hello@myqa.app'
  }
}
