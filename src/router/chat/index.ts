
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateChatSessionBelongsToUser } from 'src/router/middlewares/validations';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';

/*
 * Types.
 */

const getChatSessionsSchema = {
  'type': 'object',
  'properties': {
    'beforeDate': {
      'type': 'string',
      'format': 'date-time'
    }
  },
  'required': [],
  'additionalProperties': false
} as const;

type GetChatSessionsData = FromSchema<typeof getChatSessionsSchema>

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


async function getChatSessionsController(ctx: KoaContext, next: Next) {
  const beforeDate = (ctx.query as GetChatSessionsData).beforeDate;
  const getChatSessionResult = await applicationOperations.getChatSessionsByUser(ctx.state.user.id, beforeDate);

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

  router.get(
    '/chat-sessions',
    jwtAuthenticationMiddleware,
    validateRequestSchema({ query: getChatSessionsSchema }),
    getChatSessionsController
  );

  router.delete(
    '/chat-sessions/:chatSessionId',
    jwtAuthenticationMiddleware,
    validateChatSessionBelongsToUser((ctx: KoaContext) => ctx.params.chatSessionId),
    deleteChatSessionController
  );
}



