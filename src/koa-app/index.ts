
/*
 * Module dependencies.
 */

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import koaLogger from 'koa-logger';
import logger from 'src/logger';
import passport from 'koa-passport';
import router from 'src/router';

/*
 * Export koa application.
 */

export default () => {
  const app = new Koa();

  app.use(cors({
    credentials: true,
  }));
  app.use(koaLogger((message) => {
    logger.http(message);
  }));

  app.use(bodyParser());
  app.use(passport.initialize());

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
