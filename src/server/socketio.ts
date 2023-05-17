
/*
 * Module dependencies.
 */

import { Server } from 'socket.io';
import { isNil } from 'lodash';
import config from 'src/config';
import cookie from 'cookie';
import httpServer from './koa';
import jwt from 'jsonwebtoken';
import logger from 'src/logger';

/*
 * Socket.io server configuration.
 */

const socketIoServer = new Server(httpServer, {
  cors: {
    origin: config.cors.socketConnectionOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true
});

socketIoServer.on('connect_error', (error: any) => {
  logger.debug(`Error in connect due to ${error?.message}`);
});

socketIoServer.on('connection', (socket) => {
  if (isNil(socket.request?.headers?.cookie)) {
    logger.debug('Error accepting connection - no cookie headers');

    socket.disconnect(true);

    return;
  }

  try {
    const cookies = cookie.parse(socket.request.headers.cookie);
    const token = cookies.jwt;
    const decoded = jwt.verify(token, config.authentication.signingKey) as jwt.JwtPayload;
    const room = 'user:' + decoded.id;

    socket.join('user:' + decoded.id);

    logger.debug(`User connected to room: ${room}`);
  } catch (error: any) {
    logger.debug(`Error connecting user to room: ${error?.message || ''}`);

    socket.disconnect(true);

    return;
  }
});

export default socketIoServer;
