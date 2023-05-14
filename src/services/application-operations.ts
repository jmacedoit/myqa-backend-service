
/*
 * Module dependencies.
 */

import { AnswersIntelligenceService, answersIntelligenceService } from './intelligence-service/answers';
import { AppDataSource } from 'src/data-source';
import { In } from 'typeorm';
import { KnowledgeBase } from 'src/models/knowledge-base';
import { KnowledgeBaseIntelligenceService, knowledgeBaseIntelligenceService } from './intelligence-service/knowledge-base';
import { Organization } from 'src/models/organization';
import { Resource } from 'src/models/resource';
import { User } from 'src/models/user';
import { createHash, randomBytes } from 'crypto';
import { omit } from 'lodash';
import { properties } from 'src/utilities/types';
import { v4 as uuidv4 } from 'uuid';

/*
 * Types.
 */

export type UserRegisterData = {
  id?: string;
  email: string;
  password: string;
  displayName: string;
  acceptedTerms: boolean;
};

export type KnowledgeBaseData = {
  id?: string;
  name: string;
};

export type OrganizationData = {
  id?: string,
  name: string,
  isPersonal: boolean
};

/*
 * Application operations.
 */

export class ApplicationOperations {
  knowledgeBaseService: KnowledgeBaseIntelligenceService;
  answersService: AnswersIntelligenceService;

  constructor(knowledgeBaseService: KnowledgeBaseIntelligenceService, answersService: AnswersIntelligenceService) {
    this.knowledgeBaseService = knowledgeBaseService;
    this.answersService = answersService;
  }

  async registerUser(userData: UserRegisterData) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await this.hashUserPassword(userData.password);
      const user = new User({ ...userData, hashedPassword });
      const organization = new Organization({ name: 'Private', isPersonal: true });

      user.organizations = [organization];

      const userRepository = transactionalEntityManager.getRepository(User);
      const organizationRepository = transactionalEntityManager.getRepository(Organization);

      await organizationRepository.save(organization);
      await userRepository.save(user);
    });
  }

  async hashUserPassword(plainTextPassword: string) {
    const salt = randomBytes(8).toString('hex');

    const hash = createHash('sha256')
      .update(salt + plainTextPassword)
      .digest('hex');

    return `sha256:${salt}:${hash}`;
  }

  async validatePassword(hashedPassword: string, plainTextPassword: string) {
    const [algorithm, salt, storedHash] = hashedPassword.split(':');
    const hash = createHash(algorithm)
      .update(salt + plainTextPassword)
      .digest('hex');

    const passwordsMatch = storedHash === hash;

    return passwordsMatch;
  }

  async getUser(userId: string) {
    const userRepository = AppDataSource.getRepository(User);

    return userRepository.findOneBy({ id: userId });
  }

  async getUserByEmail(email: string) {
    const userRepository = AppDataSource.getRepository(User);

    return userRepository.findOneBy({ email });
  }

  async createOrganizationForUser(organizationData: OrganizationData, userId: string): Promise<Organization> {
    let organization!: Organization;

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const organizationRepository = transactionalEntityManager.getRepository(Organization);
      const userRepository = transactionalEntityManager.getRepository(User);

      organization = new Organization({
        id: uuidv4(),
        ...organizationData
      });

      const user = await userRepository.findOne({ where: { id: userId }, relations: { organizations: true } });

      if (!user) {
        throw new Error('User not found');
      }

      await organizationRepository.save(organization);

      user.organizations.push(organization);

      await userRepository.save(user);
    });

    return organization;
  }

  async getOrganizationsByUser(userId: string) {
    const organizationRepository = AppDataSource.getRepository(Organization);

    return organizationRepository.find({ where: { users: { id: userId } } });
  }

  async updateOrganization(organizationData: OrganizationData): Promise<Organization> {
    const organizationRepository = AppDataSource.getRepository(Organization);

    const organization = await organizationRepository.findOneBy({ id: organizationData.id });

    if (!organization) {
      throw new Error('Organization not found');
    }

    Object.assign(organization, omit(organizationData, [properties<Organization>().id]));

    await organizationRepository.save(organization);

    return organization;
  }

  async deleteOrganization(organizationId: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const organizationRepository = transactionalEntityManager.getRepository(Organization);

      const organization = await organizationRepository.findOneBy({ id: organizationId });

      if (!organization) {
        throw new Error('Organization not found');
      }

      if (organization.isPersonal) {
        throw new Error('Cannot delete personal organization');
      }

      const userRepository = transactionalEntityManager.getRepository(User);
      const users = await userRepository.find({ where: { organizations: { id: organization.id } }, relations: { organizations: true } });

      users.forEach((user) => {
        user.organizations = user.organizations.filter((userOrganization) => userOrganization.id !== organization.id);
      });

      await userRepository.save(users);
      await organizationRepository.delete({ id: organization.id });
    });
  }

  async createKnowledgeBase(knowledgeBaseData: KnowledgeBaseData, organizationId: string): Promise<KnowledgeBase> {
    const knowledgeBaseRepository = AppDataSource.getRepository(KnowledgeBase);
    const knowledgeBase = new KnowledgeBase({
      id: uuidv4(),
      ...knowledgeBaseData
    });

    knowledgeBase.organization = { id: organizationId } as Organization;

    await knowledgeBaseRepository.save(knowledgeBase);

    return omit(knowledgeBase, [properties<KnowledgeBase>().organization]) as KnowledgeBase;
  }

  async getKnowledgeBasesByUserWithOrganization(userId: string) {
    const knowledgeBaseRepository = AppDataSource.getRepository(KnowledgeBase);
    const organizationRepository = AppDataSource.getRepository(Organization);

    const userOrganizations = await organizationRepository.find({ where: { users: { id: userId } } });

    return knowledgeBaseRepository.find({
      where: {
        organization: {
          id: In(userOrganizations.map(organization => organization.id))
        }
      },
      relations: { organization: true }
    });
  }

  async getKnowledgeBasesByOrganization(organizationId: string) {
    const knowledgeBaseRepository = AppDataSource.getRepository(KnowledgeBase);

    return knowledgeBaseRepository.find({ where: { organization: { id: organizationId } } });
  }

  async getKnowledgeBaseWithOrganization(knowledgeBaseId: string) {
    const knowledgeBaseRepository = AppDataSource.getRepository(KnowledgeBase);
    const knowledgeBase = await knowledgeBaseRepository.findOne({ where: { id: knowledgeBaseId }, relations: { organization: true } });

    return knowledgeBase;
  }

  async updateKnowledgeBase(knowledgeBaseData: Partial<KnowledgeBaseData>): Promise<KnowledgeBase> {
    const knowledgeBaseRepository = AppDataSource.getRepository(KnowledgeBase);

    const knowledgeBase = await knowledgeBaseRepository.findOneBy({ id: knowledgeBaseData.id });

    if (!knowledgeBase) {
      throw new Error('Knowledge base not found');
    }

    Object.assign(knowledgeBase, omit(knowledgeBaseData, [properties<KnowledgeBase>().id]));

    await knowledgeBaseRepository.save(knowledgeBase);

    return knowledgeBase;
  }

  async deleteKnowledgeBase(knowledgeBaseId: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const resourceRepository = transactionalEntityManager.getRepository(Resource);
      const knowledgeBaseRepository = transactionalEntityManager.getRepository(KnowledgeBase);

      await resourceRepository.delete({ knowledgeBase: { id: knowledgeBaseId } as KnowledgeBase });
      await knowledgeBaseRepository.delete({ id: knowledgeBaseId });
    });

    await this.knowledgeBaseService.removeKnowledgeBase(knowledgeBaseId);
  }

  async addFileResourceToKnowledgeBase(knowledgeBaseId: string, fileName: string, fileContent: Buffer): Promise<Resource> {
    const resourceRepository = AppDataSource.getRepository(Resource);
    const resource = new Resource({
      id: uuidv4(),
      type: 'FILE', metadata: { fileName }
    });

    resource.knowledgeBase = { id: knowledgeBaseId } as KnowledgeBase;

    await this.knowledgeBaseService.assimilateResource(knowledgeBaseId, resource.id, fileContent, fileName);

    await resourceRepository.save(resource);

    return omit(resource, [properties<Resource>().knowledgeBase]) as Resource;
  }

  async deleteResourceFromKnowledgeBase(resourceId: string, knowledgeBaseId: string) {
    const resourceRepository = AppDataSource.getRepository(Resource);

    await this.knowledgeBaseService.removeResource(knowledgeBaseId, resourceId);

    await resourceRepository.delete({ id: resourceId });
  }

  async getResourcesByKnowledgeBase(knowledgeBaseId: string) {
    const resourceRepository = AppDataSource.getRepository(Resource);

    return resourceRepository.find({ where: { knowledgeBase: { id: knowledgeBaseId } } });
  }

  async getAnswer(question: string, knowledgeBaseId: string) {
    return await this.answersService.addAnswerRequest(knowledgeBaseId, question);
  }

}

export const applicationOperations = new ApplicationOperations(knowledgeBaseIntelligenceService, answersIntelligenceService);
