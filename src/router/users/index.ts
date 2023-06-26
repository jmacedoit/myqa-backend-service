
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { User } from 'src/models/user';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { omit } from 'lodash';
import { properties } from 'src/utilities/types';
import { validate as validateEmail } from 'deep-email-validator';
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

  if (!(await validateEmail(email)).valid) {
    ctx.throw(400, 'Invalid email');
  }

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


async function getAuthenticatedUserController(ctx: KoaContext, next: Next) {
  ctx.status = 200;
  ctx.body = omit(ctx.state.user as User, properties<User>().password) ;

  return next();
}

/*
 * Add user routes.
 */

export function addUserRoutes(router: Router<any, any>) {
  router.get(
    '/authenticated-user',
    jwtAuthenticationMiddleware,
    getAuthenticatedUserController
  );

  router.post(
    '/users',
    validateRequestSchema({ body: createUserSchema }),
    createUserController
  );
}
