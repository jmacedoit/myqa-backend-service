
/*
 * Module dependencies.
 */

import { ChatMessage } from './models/chat-message';
import { ChatSession } from './models/chat-session';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EmailVerificationToken } from './models/email-verification-token';
import { KnowledgeBase } from './models/knowledge-base';
import { Organization } from './models/organization';
import { OrganizationPlan } from './models/organization-plan';
import { PasswordResetToken } from './models/password-reset-token';
import { Plan } from './models/plan';
import { Resource } from 'src/models/resource';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SpendingRecord } from './models/spending-record';
import { User } from './models/user';
import config from './config';

/*
 * Datasource setup.
 */

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: config.datasource.host,
  port: config.datasource.port,
  username: config.datasource.username,
  password: config.datasource.password,
  database: config.datasource.database,
  entities: [
    EmailVerificationToken,
    PasswordResetToken,
    Resource,
    Organization,
    User,
    KnowledgeBase,
    ChatSession,
    ChatMessage,
    Plan,
    OrganizationPlan,
    SpendingRecord
  ],
  synchronize: true,
  migrations: [],
  migrationsTableName: 'migrations',
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'Z'
};

export const AppDataSource = new DataSource(dataSourceOptions);
