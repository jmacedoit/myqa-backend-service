
/*
 * Module dependencies.
 */

import 'reflect-metadata';
import { AppDataSource, dataSourceOptions } from './data-source';
import { addHealthChecks } from './utilities/health-checks';
import { createDatabase } from 'typeorm-extension';
import config from './config';
import koaApp from './koa-app';
import logger from './logger';

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

  const server = koaApp().listen(port);

  addHealthChecks(server);

  logger.info(`Koa now listening to port ${port}`);
}, 1000);

