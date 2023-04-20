
/*
 * Module dependencies.
 */

import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { Schema, validate } from 'jsonschema';

/*
 * Validate request middleware.
 */

export function validateRequestSchema(requestSchemas: { query?: Schema | any, params?: Schema | any, body?: Schema | any }) {
  return (ctx: KoaContext, next: Next) => {
    if (requestSchemas.query) {
      const validationResult = validate(ctx.query, requestSchemas.query);

      if (!validationResult.valid) {
        ctx.status = 400;
        ctx.body = validationResult.errors.map(error => 'Query: ' + error.message);

        return;
      }
    }

    if (requestSchemas.params) {
      const validationResult = validate(ctx.params, requestSchemas.params);

      if (!validationResult.valid) {
        ctx.status = 400;
        ctx.body = validationResult.errors.map(error => 'Path: ' + error.message);

        return;
      }
    }

    if (requestSchemas.body) {
      const validationResult = validate(ctx.request.body, requestSchemas.body);

      if (!validationResult.valid) {
        ctx.status = 400;
        ctx.body = validationResult.errors.map(error => 'Body: ' + error.message);

        return;
      }
    }

    return next();
  };
}
