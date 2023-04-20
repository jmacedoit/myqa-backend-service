
/*
 * Module dependencies.
 */

import { addAnswersRoutes } from './answers';
import { addAuthenticationRoutes } from './authentication';
import { addKnowledgeBaseRoutes } from './knowledge-bases';
import { addOrganizationRoutes } from './organizations';
import { addUserRoutes } from './users';
import Router from 'koa-router';

/*
 * Configure router and register routes.
 */

const router = new Router();

addAuthenticationRoutes(router);
addOrganizationRoutes(router);
addKnowledgeBaseRoutes(router);
addUserRoutes(router);
addAnswersRoutes(router);

/*
 * Export router.
 */

export default router;
