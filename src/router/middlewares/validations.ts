
/*
 * Module dependencies.
 */

import { KoaContext } from 'src/types/koa';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import logger from 'src/logger';

/*
 * Validatators.
 */

export function validateKnowledgeBaseIsInUserOrganization(getKnowledgeBaseId: (ctx: KoaContext) => string) {
  return async (ctx: KoaContext, next: Next) => {
    const knowledgeBase = await applicationOperations.getKnowledgeBaseWithOrganization(getKnowledgeBaseId(ctx));
    const userOrganizations = await applicationOperations.getOrganizationsByUser(ctx.state.user.id);

    if (knowledgeBase === null) {
      logger.debug('Knowledge base not found');

      ctx.status = 404;

      return;
    }

    if (userOrganizations.every((organization) => organization.id !== knowledgeBase?.organization.id)) {
      logger.debug('User is not part of the organization');

      ctx.status = 403;

      return;
    }

    return next();
  };
}
