
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateChatSessionBelongsToUser, validateKnowledgeBaseIsInUserOrganization } from 'src/router/middlewares/validations';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';
import crypto from 'crypto';

/*
 * Types.
 */

const createAnswerBodySchema = {
  'type': 'object',
  'properties': {
    'question': {
      'type': 'string'
    },
    'knowledgeBaseId': {
      'type': 'string'
    },
    'questionReference': {
      'type': 'string'
    },
    'chatSessionId': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': ['chatSessionId', 'question', 'knowledgeBaseId']
} as const;

type CreateAnswerRequestData = FromSchema<typeof createAnswerBodySchema>

/*
 * Controllers.
 */

async function createAnswerRequestController(ctx: KoaContext, next: Next) {
  const createAnswerRequestData = ctx.request.body as CreateAnswerRequestData;
  const userId = ctx.state.user.id;
  const chatSessionId = createAnswerRequestData.chatSessionId as string;
  const questionReference = createAnswerRequestData.questionReference ?? crypto.randomBytes(8).toString('hex');
  const reference = `${userId}:${questionReference}`;

  const answerRequest = await applicationOperations.requestAnswerForChatSession(
    createAnswerRequestData.question,
    createAnswerRequestData.knowledgeBaseId,
    chatSessionId,
    reference
  );

  ctx.status = 200;
  ctx.body = answerRequest;

  return next();
}

/*
 * Add organization routes.
 */

export function addAnswersRoutes(router: Router<any, any>) {
  router.post(
    '/answer-request',
    jwtAuthenticationMiddleware,
    validateRequestSchema({ body: createAnswerBodySchema }),
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => (ctx.request.body as CreateAnswerRequestData).knowledgeBaseId),
    validateChatSessionBelongsToUser((ctx: KoaContext) => (ctx.request.body as CreateAnswerRequestData).chatSessionId),
    createAnswerRequestController
  );
}
