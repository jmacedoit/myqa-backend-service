
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateChatSessionBelongsToUser, validateKnowledgeBaseIsInUserOrganization, validateMessageBelongsToUser } from 'src/router/middlewares/validations';
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
    },
    'language': {
      'type': 'string'
    },
    'wisdomLevel': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': ['chatSessionId', 'question', 'knowledgeBaseId']
} as const;

type CreateAnswerRequestData = FromSchema<typeof createAnswerBodySchema>


const retreiveSourcesDataBodySchema = {
  'type': 'object',
  'properties': {
    'messageId': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': ['messageId']
} as const;

type RetrieveSourcesDataBody = FromSchema<typeof retreiveSourcesDataBodySchema>

/*
 * Controllers.
 */

async function createAnswerRequestController(ctx: KoaContext, next: Next) {
  const createAnswerRequestData = ctx.request.body as CreateAnswerRequestData;
  const userId = ctx.state.user.id;
  const chatSessionId = createAnswerRequestData.chatSessionId as string;
  const questionReference = createAnswerRequestData.questionReference ?? crypto.randomBytes(8).toString('hex');
  const language = createAnswerRequestData.language;
  const wisdomLevel = createAnswerRequestData.wisdomLevel;
  const reference = `${userId}:${questionReference}`;

  const answerRequest = await applicationOperations.requestAnswerForChatSession(
    createAnswerRequestData.question,
    createAnswerRequestData.knowledgeBaseId,
    chatSessionId,
    reference,
    language,
    wisdomLevel
  );

  ctx.status = 200;
  ctx.body = answerRequest;

  return next();
}

async function retrieveAnswerSourcesController(ctx: KoaContext, next: Next) {
  const retrieveAnswerSourcesRequestData = ctx.request.body as RetrieveSourcesDataBody;
  const messageId = retrieveAnswerSourcesRequestData.messageId;

  const answerSources = await applicationOperations.retrieveAnswerSources(messageId);

  ctx.status = 200;
  ctx.body = {
    sources: answerSources
  };

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

  router.post(
    '/answer-sources-retrieval',
    jwtAuthenticationMiddleware,
    validateRequestSchema({ body: retreiveSourcesDataBodySchema }),
    validateMessageBelongsToUser((ctx: KoaContext) => (ctx.request.body as RetrieveSourcesDataBody).messageId),
    retrieveAnswerSourcesController
  );
}
