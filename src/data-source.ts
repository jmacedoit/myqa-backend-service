
/*
 * Module dependencies.
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import { KnowledgeBase } from './models/knowledge-base';
import { Organization } from './models/organization';
import { Resource } from 'src/models/resource';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
  entities: [Resource, Organization, User, KnowledgeBase],
  synchronize: true,
  migrations: [],
  migrationsTableName: 'migrations',
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'Z'
};

export const AppDataSource = new DataSource(dataSourceOptions);
