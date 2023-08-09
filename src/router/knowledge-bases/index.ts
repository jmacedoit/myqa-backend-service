

/*
 * Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { isNil } from 'lodash';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateKnowledgeBaseIsInUserOrganization } from 'src/router/middlewares/validations';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';
import config from 'src/config';
import logger from 'src/logger';
import mime from 'mime-types';
import multer from '@koa/multer';

/*
 * Types.
 */

const createKnowledgeBaseSchema = {
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string'
    },
    'organizationId': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': ['name', 'organizationId']
} as const;

type CreateKnowledgeBaseData = FromSchema<typeof createKnowledgeBaseSchema>;

const updateKnowledgeBaseSchema = {
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': []
} as const;

type UpdateKnowledgeBaseData = FromSchema<typeof updateKnowledgeBaseSchema>;

const getKnowledgeBasesSchema = {
  'type': 'object',
  'properties': {
    'organizationId': {
      'type': 'string'
    }
  },
  'additionalProperties': false
} as const;

type GetKnowledgeBasesData = FromSchema<typeof getKnowledgeBasesSchema>

/*
 * Validations.
 */

function validateIsUserOrganization(getOrganizationId: (ctx: KoaContext) => string) {
  return async (ctx: KoaContext, next: Next) => {
    const userOrganizations = await applicationOperations.getOrganizationsByUser(ctx.state.user.id);

    if (!userOrganizations.some((organization) => organization.id === getOrganizationId(ctx))) {
      logger.debug('User is not part of the organization');

      ctx.status = 403;

      return;
    }

    return next();
  };
}

function validateKnowledgeBaseHasResource(getKnowledgeBaseId: (ctx: KoaContext) => string, getResourceId: (ctx: KoaContext) => string) {
  return async (ctx: KoaContext, next: Next) => {
    const resources = await applicationOperations.getResourcesByKnowledgeBase(getKnowledgeBaseId(ctx));
    const resource = resources.find((resource) => resource.id === getResourceId(ctx));

    if (isNil(resource)) {
      ctx.status = 404;

      return;
    }

    return next();
  };
}

function validateResourceFile(getFile: (ctx: KoaContext) => multer.File) {
  return async (ctx: KoaContext, next: Next) => {
    const legalExtensions = ['.doc', '.docx', '.pdf', '.ppt', '.pptx', '.txt', '.html', 'md'].map(extension => mime.lookup(extension) as string);

    if (!legalExtensions.includes(getFile(ctx).mimetype)) {
      logger.debug('File type not allowed');

      ctx.status = 400;

      return;
    }

    if (getFile(ctx).size > config.resources.maxFileSize) {
      logger.debug('File is too big');

      ctx.status = 400;

      return;
    }

    return next();
  };
}

/*
 * Controllers.
 */

async function getKnowledgeBaseResourcesController(context: KoaContext, next: Next) {
  const knowledgeBaseId = context.params.knowledgeBaseId;

  context.body = await applicationOperations.getResourcesByKnowledgeBase(knowledgeBaseId);
  context.status = 200;

  return next();
}

async function postKnowledgeBaseResourceController(context: KoaContext, next: Next) {
  const knowledgeBaseId = context.params.knowledgeBaseId;
  const file = (context.request.files as { [fieldname: string]: multer.File[] }).resource[0];
  const userId = context.state.user.id;
  const addFileResourceResult = await applicationOperations.addFileResourceToKnowledgeBase(userId, knowledgeBaseId, file.originalname, file.buffer);

  context.body = addFileResourceResult;
  context.status = 200;

  return next();
}

async function deleteKnowledgeBaseResourceController(context: KoaContext, next: Next) {
  const knowledgeBaseId = context.params.knowledgeBaseId;
  const resourceId = context.params.resourceId;

  await applicationOperations.getResourcesByKnowledgeBase(knowledgeBaseId);

  await applicationOperations.deleteResourceFromKnowledgeBase(resourceId, knowledgeBaseId);

  context.status = 200;

  return next();
}

async function deleteKnowledgeBaseController(context: KoaContext, next: Next) {
  const knowledgeBaseId = context.params.knowledgeBaseId;

  await applicationOperations.deleteKnowledgeBase(knowledgeBaseId);

  context.status = 200;

  return next();
}

async function postKnowledgeBaseController(context: KoaContext, next: Next) {
  const createKnowledgeBaseData = context.request.body as CreateKnowledgeBaseData;
  const createKnowledgeBaseResult = await applicationOperations.createKnowledgeBase(createKnowledgeBaseData, createKnowledgeBaseData.organizationId);

  context.body = createKnowledgeBaseResult;
  context.status = 200;

  return next();
}

async function patchKnowledgeBaseController(context: KoaContext, next: Next) {
  const knowledgeBaseId = context.params.knowledgeBaseId;
  const updateKnowledgeBaseResult = await applicationOperations.updateKnowledgeBase({
    id: knowledgeBaseId,
    ...(context.request.body as UpdateKnowledgeBaseData)
  });

  context.body = updateKnowledgeBaseResult;
  context.status = 200;

  return next();
}

async function getKnowledgeBasesController(ctx: KoaContext, next: Next) {
  const getKnowledgeBasesData = ctx.query as GetKnowledgeBasesData;
  const organizationId = getKnowledgeBasesData.organizationId;
  const knowledgeBases = await applicationOperations.getKnowledgeBasesByUserWithOrganization(ctx.state.user.id);

  if (!isNil(organizationId)) {
    ctx.status = 200;
    ctx.body = knowledgeBases.filter((knowledgeBase) => knowledgeBase.organization.id === organizationId);
  } else {
    ctx.status = 200;
    ctx.body = knowledgeBases;
  }

  return next();
}

/*
 * Add knowledge bases routes.
 */

export function addKnowledgeBaseRoutes(router: Router<any, any>) {
  const upload = multer({
    fileFilter: (_req, file, cb) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );

      cb(null, true);
    }
  });

  router.get(
    '/knowledge-bases/:knowledgeBaseId/resources',
    jwtAuthenticationMiddleware,
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => ctx.params.knowledgeBaseId),
    getKnowledgeBaseResourcesController
  );

  router.post(
    '/knowledge-bases/:knowledgeBaseId/resources',
    jwtAuthenticationMiddleware,
    upload.fields([
      {
        name: 'resource',
        maxCount: 1
      }
    ]),
    validateResourceFile((ctx: KoaContext) => (ctx.request.files as { [fieldname: string]: multer.File[] }).resource?.[0]),
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => ctx.params.knowledgeBaseId),
    postKnowledgeBaseResourceController
  );

  router.delete(
    '/knowledge-bases/:knowledgeBaseId/resources/:resourceId',
    jwtAuthenticationMiddleware,
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => ctx.params.knowledgeBaseId),
    validateKnowledgeBaseHasResource((ctx: KoaContext) => ctx.params.knowledgeBaseId, (ctx: KoaContext) => ctx.params.resourceId),
    deleteKnowledgeBaseResourceController
  );

  router.delete(
    '/knowledge-bases/:knowledgeBaseId',
    jwtAuthenticationMiddleware,
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => ctx.params.knowledgeBaseId),
    deleteKnowledgeBaseController
  );

  router.patch(
    '/knowledge-bases/:knowledgeBaseId',
    validateRequestSchema({ body: updateKnowledgeBaseSchema }),
    jwtAuthenticationMiddleware,
    validateKnowledgeBaseIsInUserOrganization((ctx: KoaContext) => ctx.params.knowledgeBaseId),
    patchKnowledgeBaseController
  );

  router.post(
    '/knowledge-bases',
    validateRequestSchema({ body: createKnowledgeBaseSchema }),
    jwtAuthenticationMiddleware,
    validateIsUserOrganization((ctx: KoaContext) => (ctx.request.body as CreateKnowledgeBaseData).organizationId),
    postKnowledgeBaseController
  );

  router.get(
    '/knowledge-bases',
    validateRequestSchema({ query: getKnowledgeBasesSchema }),
    jwtAuthenticationMiddleware,
    getKnowledgeBasesController
  );
}


