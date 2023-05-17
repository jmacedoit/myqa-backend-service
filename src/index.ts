
/*
 * Module dependencies.
 */

import 'reflect-metadata';
import { AppDataSource, dataSourceOptions } from './data-source';
import { addHealthChecks } from './utilities/health-checks';
import { createDatabase } from 'typeorm-extension';
import { io as ioClient } from 'socket.io-client';
import { setupIntelligenceServiceSocketHandlers } from './socker-handlers/intelligence-service';
import config from './config';
import httpServer from './server/koa';
import logger from './logger';
import socketIoServer from './server/socketio';


/*
 * Dump node warnings and errors.
 */

process.on('warning', error => logger.warn(error.stack));

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'Reason:', reason);
  console.log((reason as any).stack); // Logs the stack trace
});

/*
 * Initialization logs.
 */

logger.info(`${config.serviceName} initialized!`);
logger.debug(`Settings: ${JSON.stringify(config, null, 2)}`);

/*
 * Datasource setup.
 */

(async () => {
  try {
    await createDatabase({
      ifNotExist: true,
      options: dataSourceOptions
    });

    await AppDataSource.initialize();
  }
  catch (error) {
    logger.error(`Error initializing datasource: ${error}`);
  }
})();


/*
 * Start koa app.
 */

setTimeout(async () => {
  const port = config.server.port;

  addHealthChecks(httpServer);

  socketIoServer.on('connection', () => { return; });

  httpServer.listen(port);

  const intelligenceServiceSocket = ioClient(config.intelligenceService.url);

  setupIntelligenceServiceSocketHandlers(intelligenceServiceSocket);

  logger.info(`Koa now listening to port ${port}`);
}, 1000);

