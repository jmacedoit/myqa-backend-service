
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';

/*
 * Types.
 */

const createUserSchema = {
  'type': 'object',
  'properties': {
    'email': {
      'type': 'string',
      'format': 'email'
    },
    'password': {
      'type': 'string'
    },
    'acceptedTerms': {
      'type': 'boolean'
    },
    'displayName': {
      'type': 'string'
    }
  },
  'required': ['email', 'password', 'acceptedTerms', 'displayName']
} as const;

type CreateUserData = FromSchema<typeof createUserSchema>;

/*
 * Controllers.
 */

async function createUserController(ctx: KoaContext, next: Next) {
  const { email, password, acceptedTerms, displayName } = ctx.request.body as CreateUserData;

  if (!acceptedTerms) {
    ctx.throw(400, 'Terms must be accepted');
  }

  if (await applicationOperations.getUserByEmail(email) !== null) {
    ctx.throw(409, 'User already exists');
  }

  await applicationOperations.registerUser({ email, password, acceptedTerms, displayName });

  ctx.status = 200;
  ctx.body = { email, acceptedTerms, displayName };

  return next();
}

/*
 * Add user routes.
 */

export function addUserRoutes(router: Router<any, any>) {
  router.post(
    '/users',
    validateRequestSchema({ body: createUserSchema }),
    createUserController
  );
}
