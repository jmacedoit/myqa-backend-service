
/*
 *  Module dependencies.
 */

import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import { jwtAuthenticationMiddleware } from 'src/router/middlewares/authentication';
import Router from 'koa-router';

/*
 * Controllers.
 */

async function getOrganizationsController(ctx: KoaContext, next: Next) {
  const organizations = await applicationOperations.getOrganizationsByUser(ctx.state.user.id);

  ctx.status = 200;
  ctx.body = organizations;

  return next();
}

/*
 * Add organization routes.
 */

export function addOrganizationRoutes(router: Router<any, any>) {
  router.get(
    '/organizations',
    jwtAuthenticationMiddleware,
    getOrganizationsController
  );
}
