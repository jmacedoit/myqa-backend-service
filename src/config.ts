
/*
 * Module dependencies.
 */
// eslint-disable-next-line no-restricted-imports
import config from 'config';

/*
 * Type config and ensure that values passed via environment variables as strings are correctly converted into correct type.
 */

export default {
  serviceName: config.get('serviceName') as string,
  server: {
    port: parseInt(config.get('server.port'), 10),
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
  },
  intelligenceService: {
    url: config.get('intelligenceService.url') as string,
  },
  resources: {
    maxFileSize: parseInt(config.get('resources.maxFileSize'), 10)
  }
};