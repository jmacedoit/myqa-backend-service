
/*
 * Module dependencies.
 */

import { addAccessRecoveryRoutes } from './access-recovery';
import { addAnswersRoutes } from './answers';
import { addAuthenticationRoutes } from './authentication';
import { addChatRoutes } from './chat';
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
addChatRoutes(router);
addAnswersRoutes(router);
addEmailVerificationRoutes(router);
addAccessRecoveryRoutes(router);

/*
 * Export router.
 */

export default router;
