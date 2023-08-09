
/*
 *  Module dependencies.
 */

import { FromSchema } from 'json-schema-to-ts';
import { InvalidCredentials, applicationOperations } from 'src/services/application-operations';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';

/*
 * Types.
 */

const changePasswordRequestSchema = {
  'type': 'object',
  'properties': {
    'oldPassword': {
      'type': 'string'
    },
    'newPassword': {
      'type': 'string'
    }
  },
  'additionalProperties': false,
  'required': ['oldPassword', 'newPassword']
} as const;

type ChangePasswordRequestData = FromSchema<typeof changePasswordRequestSchema>;

/*
 * Controllers.
 */

async function changePasswordController(ctx: KoaContext, next: Next) {
  const { oldPassword, newPassword } = ctx.request.body as ChangePasswordRequestData;

  try {
    await applicationOperations.changePassword(ctx.state.user.id, oldPassword, newPassword);
  }
  catch (error) {
    if (error instanceof InvalidCredentials) {
      ctx.throw(401, 'Invalid credentials');
    }

    throw error;
  }

  ctx.status = 200;

  return next();
}

/*
 * Add account routes.
 */

export function addAccountRoutes(router: Router<any, any>) {
  router.post(
    '/password-change',
    jwtAuthenticationMiddleware,
    validateRequestSchema({ body: changePasswordRequestSchema }),
    changePasswordController
  );
}
