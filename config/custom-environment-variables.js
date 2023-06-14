
/*
 * Custom environment variables configuration.
 */

module.exports = {
  api: {
    prefix: 'API_PREFIX'
  },
  authentication: {
    signingKey: 'AUTH_SIGNING_KEY',
    expirationTime: 'AUTH_EXPIRATION_TIME',
    secureCookies: 'AUTH_SECURE_COOKIES'
  },
  datasource: {
    host: 'DATASOURCE_HOST',
    port: 'DATASOURCE_PORT',
    username: 'DATASOURCE_USERNAME',
    password: 'DATASOURCE_PASSWORD',
    database: 'DATASOURCE_DATABASE'
  },
  serviceName: 'SERVICE_NAME',
  server: {
    port: 'SERVER_PORT'
  },
  cors: {
    socketConnectionOrigin: 'CORS_SOCKET_CONNECTION_ORIGIN'
  },
  logger: {
    datePattern: 'LOGGER_DATEPATTERN',
    format: 'LOGGER_FORMAT',
    level: 'LOGGER_LEVEL',
    maxFiles: 'LOGGER_MAXFILES',
    maxSize: 'LOGGER_MAXSIZE',
    zippedArchive: 'LOGGER_ZIPPEDARCHIVE'
  },
  intelligenceService: {
    url: 'INTELLIGENCE_SERVICE_URL'
  },
  resources: {
    maxFileSize: 'RESOURCES_MAXFILESIZE'
  }
};
