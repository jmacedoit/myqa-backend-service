
/*
 * Module dependencies.
 */

import { createServer } from 'http';
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

function createKoaApp() {
  const app = new Koa({
    proxy: true
  });

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
}

/*
 * Export koa server.
 */

const koaApp = createKoaApp();

export default createServer(koaApp.callback());
