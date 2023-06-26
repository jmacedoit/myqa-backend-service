

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

const verifyEmailSchema = {
  'type': 'object',
  'properties': {
    'token': {
      'type': 'string'
    }
  },
  'required': ['token']
} as const;

type VerifyEmailData = FromSchema<typeof verifyEmailSchema>;

/*
 * Controllers.
 */

async function verifyEmailController(ctx: KoaContext, next: Next) {
  const { token } = ctx.request.body as VerifyEmailData;

  try {
    await applicationOperations.verifyUserEmail(token);
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
 * Add email verification routes.
 */

export function addEmailVerificationRoutes(router: Router<any, any>) {
  router.post(
    '/email-verification',
    validateRequestSchema({ body: verifyEmailSchema }),
    verifyEmailController
  );
}
