
/*
 * Custom environment variables configuration.
 */

module.exports = {
  server: {
    port: 'SERVER_PORT'
  },
  logger: {
    datePattern: 'LOGGER_DATEFORMAT',
    format: 'LOGGER_FORMAT',
    level: 'LOGGER_LEVEL',
    maxFiles: 'LOGGER_MAXFILES',
    maxSize: 'LOGGER_MAXSIZE',
    zippedArchive: 'LOGGER_ZIPPEDARCHIVE'
  },
  authentication: {
    signingKey: 'AUTHENTICATION_SIGNIN_GKEY',
    expirationTime: 'AUTHENTICATION_EXPIRATION_TIME',
    secureCookies: 'AUTHENTICATION_SECURE_COOKIES'
  },
  intelligenceService: {
    url: 'INTELLIGENCE_SERVICE_URL'
  }
};
