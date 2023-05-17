
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateKnowledgeBaseIsInUserOrganization } from 'src/router/middlewares/validations';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';
import crypto from 'crypto';

/*
 * Types.
 */

const createAnswerRequestSchema = {
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
    }
  },
  'additionalProperties': false,
  'required': ['question', 'knowledgeBaseId']
} as const;

type CreateAnswerRequestData = FromSchema<typeof createAnswerRequestSchema>

/*
 * Controllers.
 */

async function createAnswerRequestController(ctx: KoaContext, next: Next) {
  const createAnswerRequestData = ctx.request.body as CreateAnswerRequestData;
  const userId = ctx.state.user.id;
  const questionReference = createAnswerRequestData.questionReference ?? crypto.randomBytes(8).toString('hex');
  const reference = `${userId}:${questionReference}`;

  const answerRequest = await applicationOperations.getAnswer(
    createAnswerRequestData.question,
    createAnswerRequestData.knowledgeBaseId,
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
    validateRequestSchema({ body: createAnswerRequestSchema }),
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => (ctx.request.body as CreateAnswerRequestData).knowledgeBaseId),
    createAnswerRequestController
  );
}
