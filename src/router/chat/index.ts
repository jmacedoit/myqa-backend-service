
/*
 *  Module dependencies.
 */

import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateChatSessionBelongsToUser } from 'src/router/middlewares/validations';
import Router from 'koa-router';

/*
 * Controllers.
 */

async function createChatSessionController(ctx: KoaContext, next: Next) {
  const createChatSessionResult = await applicationOperations.createChatSession(ctx.state.user.id);

  ctx.status = 200;
  ctx.body = createChatSessionResult;

  return next();
}

async function getChatSessionController(ctx: KoaContext, next: Next) {
  const chatSessionId = ctx.params.chatSessionId;
  const getChatSessionResult = await applicationOperations.getChatSessionWithMessages(chatSessionId);

  ctx.status = 200;
  ctx.body = getChatSessionResult;

  return next();
}

async function deleteChatSessionController(ctx: KoaContext, next: Next) {
  const chatSessionId = ctx.params.chatSessionId;

  await applicationOperations.deleteChatSession(chatSessionId);

  ctx.status = 200;

  return next();
}

/*
 * Add email verification routes.
 */

export function addChatRoutes(router: Router<any, any>) {
  router.post(
    '/chat-sessions',
    jwtAuthenticationMiddleware,
    createChatSessionController
  );

  router.get(
    '/chat-sessions/:chatSessionId',
    jwtAuthenticationMiddleware,
    validateChatSessionBelongsToUser((ctx: KoaContext) => ctx.params.chatSessionId),
    getChatSessionController
  );

  router.delete(
    '/chat-sessions/:chatSessionId',
    jwtAuthenticationMiddleware,
    validateChatSessionBelongsToUser((ctx: KoaContext) => ctx.params.chatSessionId),
    deleteChatSessionController
  );
}



