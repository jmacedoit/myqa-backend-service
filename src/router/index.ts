
/*
 * Module dependencies.
 */

import { addAnswersRoutes } from './answers';
import { addAuthenticationRoutes } from './authentication';
import { addEmailVerificationRoutes } from './email-verification';
import { addKnowledgeBaseRoutes } from './knowledge-bases';
import { addOrganizationRoutes } from './organizations';
import { addUserRoutes } from './users';
import Router from 'koa-router';
import config from 'src/config';

/*
 * Configure router and register routes.
 */

const router = new Router({
  prefix: config.api.prefix
});

addAuthenticationRoutes(router);
addOrganizationRoutes(router);
addKnowledgeBaseRoutes(router);
addUserRoutes(router);
addAnswersRoutes(router);
addEmailVerificationRoutes(router);

/*
 * Export router.
 */

export default router;
