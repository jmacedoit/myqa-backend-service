
/*
 * Module dependencies.
 */

import { Socket } from 'socket.io-client';
import socketIoServer from 'src/server/socketio';

/*
 * Setup intelligence service socket handlers.
 */

export function setupIntelligenceServiceSocketHandlers(socket: Socket) {
  socket.on('answer_token', ({ reference, token }: { reference: string, token: string }) => {
    const [userId, questionReference] = reference.split(':');

    socketIoServer.to('user:' + userId).emit('answer_token', { questionReference, token });
  });
}
