
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
  }
};
