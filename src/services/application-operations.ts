
/*
 * Module dependencies.
 */

import { AnswersIntelligenceService, answersIntelligenceService } from './intelligence-service/answers';
import { AppDataSource } from 'src/data-source';
import { EmailService, emailService } from './email-service';
import { EmailVerificationToken } from 'src/models/email-verification-token';
import { In } from 'typeorm';
import { KnowledgeBase } from 'src/models/knowledge-base';
import { KnowledgeBaseIntelligenceService, knowledgeBaseIntelligenceService } from './intelligence-service/knowledge-base';
import { Organization } from 'src/models/organization';
import { PasswordResetToken } from 'src/models/password-reset-token';
import { Resource } from 'src/models/resource';
import { User } from 'src/models/user';
import { createHash, randomBytes } from 'crypto';
import { isTokenNotExpired } from 'src/utilities/tokens';
import { omit } from 'lodash';
import { properties } from 'src/utilities/types';
import { v4 as uuidv4 } from 'uuid';
import config from 'src/config';

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
  emailService: EmailService;

  constructor(knowledgeBaseService: KnowledgeBaseIntelligenceService, answersService: AnswersIntelligenceService, emailService: EmailService) {
    this.knowledgeBaseService = knowledgeBaseService;
    this.answersService = answersService;
    this.emailService = emailService;
  }

  async registerUser(userData: UserRegisterData) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await this.hashUserPassword(userData.password);
      const user = new User({ ...userData, hashedPassword, verifiedEmail: false });
      const organization = new Organization({ name: 'Private', isPersonal: true });
      const emailVerificationToken = new EmailVerificationToken({ token: uuidv4(), ttl: config.emailVerification.tokenTtl });

      user.organizations = [organization];

      emailVerificationToken.user = user;

      const userRepository = transactionalEntityManager.getRepository(User);
      const organizationRepository = transactionalEntityManager.getRepository(Organization);
      const emailVerificationTokenRepository = transactionalEntityManager.getRepository(EmailVerificationToken);

      await organizationRepository.save(organization);
      await userRepository.save(user);
      await emailVerificationTokenRepository.save(emailVerificationToken);

      await this.emailService.sendEmailVerificationEmail({
        userEmail: user.email,
        userDisplayName: user.displayName,
        token: emailVerificationToken.token,
        language: 'en'
      });
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

  async getAnswer(question: string, knowledgeBaseId: string, reference: string) {
    return await this.answersService.addAnswerRequest(knowledgeBaseId, question, reference);
  }

  async verifyUserEmail(emailVerificationTokenString: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const emailVerificationTokenRepository = transactionalEntityManager.getRepository(EmailVerificationToken);

      const emailVerificationToken = await emailVerificationTokenRepository.findOneBy({ token: emailVerificationTokenString });

      if (!emailVerificationToken) {
        throw new InvalidToken('Token not found');
      }

      const userRepository = transactionalEntityManager.getRepository(User);

      const user = await userRepository.findOneBy({ id: emailVerificationToken.user as unknown as string });

      if (!user) {
        throw new InvalidToken('Token has no user');
      }

      if (isTokenNotExpired(emailVerificationToken.createdAt, emailVerificationToken.ttl)) {
        throw new ExpiredToken('Token is expired');
      }

      user.verifiedEmail = true;

      await userRepository.save(user);
      await emailVerificationTokenRepository.delete({ id: emailVerificationToken.id });
    });
  }

  async createPasswordRecoveryRequest(email: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const userRepository = transactionalEntityManager.getRepository(User);
      const passwordResetTokenRepository = transactionalEntityManager.getRepository(PasswordResetToken);

      const user = await userRepository.findOneBy({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const passwordResetToken = new PasswordResetToken({ token: uuidv4(), ttl: config.emailVerification.tokenTtl });

      passwordResetToken.user = user;

      await passwordResetTokenRepository.save(passwordResetToken);

      await this.emailService.sendPasswordResetEmail({
        userEmail: user.email,
        userDisplayName: user.displayName,
        token: passwordResetToken.token,
        language: 'en'
      });
    });
  }

  async resetPassword(passwordResetTokenString: string, password: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const passwordResetTokenRepository = transactionalEntityManager.getRepository(PasswordResetToken);

      const passwordResetToken = await passwordResetTokenRepository.findOneBy({ token: passwordResetTokenString });

      if (!passwordResetToken) {
        throw new InvalidToken('Token not found');
      }

      const userRepository = transactionalEntityManager.getRepository(User);

      const user = await userRepository.findOneBy({ id: passwordResetToken.user as unknown as string });

      if (!user) {
        throw new InvalidToken('Token has no user');
      }

      if (isTokenNotExpired(passwordResetToken.createdAt, passwordResetToken.ttl)) {
        throw new ExpiredToken('Token is expired');
      }

      user.password = await this.hashUserPassword(password);

      await userRepository.save(user);
      await passwordResetTokenRepository.delete({ id: passwordResetToken.id });

      await this.emailService.sendPasswordResetConfirmationEmail({
        userEmail: user.email,
        userDisplayName: user.displayName,
        language: 'en'
      });
    });
  }
}

export class InvalidToken extends Error {
  constructor(message: string | undefined) {
    super(message);
  }
}

export class ExpiredToken extends Error {
  constructor(message: string | undefined) {
    super(message);
  }
}


export const applicationOperations = new ApplicationOperations(knowledgeBaseIntelligenceService, answersIntelligenceService, emailService);
