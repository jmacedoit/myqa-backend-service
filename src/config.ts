
/*
 * Module dependencies.
 */
// eslint-disable-next-line no-restricted-imports
import config from 'config';

/*
 * Type config and ensure that values passed via environment variables as strings are correctly converted into correct type.
 */

export default {
  api: {
    prefix: config.get('api.prefix') as string,
  },
  publicUri: config.get('publicUri') as string,
  datasource: {
    host: config.get('datasource.host') as string,
    port: parseInt(config.get('datasource.port'), 10),
    username: config.get('datasource.username') as string,
    password: config.get('datasource.password') as string,
    database: config.get('datasource.database') as string,
  },
  serviceName: config.get('serviceName') as string,
  server: {
    port: parseInt(config.get('server.port'), 10),
  },
  cors: {
    socketConnectionOrigin: config.get('cors.socketConnectionOrigin') as string
  },
  logger: {
    datePattern: config.get('logger.datePattern') as string,
    format: config.get('logger.format') as string,
    level: config.get('logger.level') as string,
    maxFiles: config.get('logger.maxFiles') as string,
    maxSize: config.get('logger.maxSize') as string,
    zippedArchive: config.get('logger.zippedArchive') === 'true' || config.get('logger.zippedArchive') === true
  },
  authentication: {
    signingKey: config.get('authentication.signingKey') as string,
    expirationTime: config.get('authentication.expirationTime') as string,
    secureCookies: config.get('authentication.secureCookies') === 'true' || config.get('authentication.secureCookies') === true
  },
  intelligenceService: {
    url: config.get('intelligenceService.url') as string,
  },
  resources: {
    maxFileSize: parseInt(config.get('resources.maxFileSize'), 10)
  },
  emailVerification: {
    tokenTtl: parseInt(config.get('emailVerification.tokenTtl'), 10),
    route: config.get('emailVerification.route') as string,
  },
  passwordReset: {
    tokenTtl: parseInt(config.get('passwordReset.tokenTtl'), 10),
    route: config.get('passwordReset.route') as string,
  },
  sendgrid: {
    apiKey: config.get('sendgrid.apiKey') as string,
    senderEmail: config.get('sendgrid.senderEmail') as string,
    senderName: config.get('sendgrid.senderName') as string
  },
  recaptcha: {
    key: config.get('recaptcha.key') as string,
    projectNumber: config.get('recaptcha.projectNumber') as string
  }
};
