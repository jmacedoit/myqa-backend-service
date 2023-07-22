

/*
 *  Module dependencies.
 */

import { ExpiredToken, InvalidToken, applicationOperations } from 'src/services/application-operations';
import { FromSchema } from 'json-schema-to-ts';
import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { validateRequestSchema } from 'src/router/middlewares/schema';
import Router from 'koa-router';

/*
 * Types.
 */

const resetPasswordRequestSchema = {
  'type': 'object',
  'properties': {
    'token': {
      'type': 'string'
    },
    'password': {
      'type': 'string'
    }
  },
  'required': ['token', 'password']
} as const;

type ResetPasswordRequestData = FromSchema<typeof resetPasswordRequestSchema>;

const passwordRecoveryRequestSchema = {
  'type': 'object',
  'properties': {
    'email': {
      'type': 'string'
    }
  },
  'required': ['email']
} as const;

type PasswordRecoveryRequestData = FromSchema<typeof passwordRecoveryRequestSchema>;

/*
 * Controllers.
 */

async function createPasswordRecoveryRequestController(ctx: KoaContext, next: Next) {
  const { email } = ctx.request.body as PasswordRecoveryRequestData;

  await applicationOperations.createPasswordRecoveryRequest(email);

  ctx.status = 200;

  return next();
}

async function resetPasswordController(ctx: KoaContext, next: Next) {
  const { token, password } = ctx.request.body as ResetPasswordRequestData;

  try {
    await applicationOperations.resetPassword(token, password);
  }
  catch (error) {
    if (error instanceof InvalidToken) {
      ctx.throw(400, 'Invalid token');
    }

    if (error instanceof ExpiredToken) {
      ctx.throw(401, 'Expired token');
    }

    throw error;
  }

  ctx.status = 200;

  return next();
}

/*
 * Add access recovery routes.
 */

export function addAccessRecoveryRoutes(router: Router<any, any>) {
  router.post(
    '/password-recovery-request',
    validateRequestSchema({ body: passwordRecoveryRequestSchema }),
    createPasswordRecoveryRequestController
  );

  router.post(
    '/password-reset',
    validateRequestSchema({ body: resetPasswordRequestSchema }),
    resetPasswordController
  );
}
