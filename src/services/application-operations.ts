
/*
 * Module dependencies.
 */

import { AnswersIntelligenceService, answersIntelligenceService } from './intelligence-service/answers';
import { AppDataSource } from 'src/data-source';
import { ChatMessage, SenderType } from 'src/models/chat-message';
import { ChatSession } from 'src/models/chat-session';
import { EmailService, emailService } from './email-service';
import { EmailVerificationToken } from 'src/models/email-verification-token';
import { In, LessThan } from 'typeorm';
import { KnowledgeBase } from 'src/models/knowledge-base';
import { KnowledgeBaseIntelligenceService, knowledgeBaseIntelligenceService } from './intelligence-service/knowledge-base';
import { Organization } from 'src/models/organization';
import { PasswordResetToken } from 'src/models/password-reset-token';
import { Resource } from 'src/models/resource';
import { User } from 'src/models/user';
import { createHash, randomBytes } from 'crypto';
import { isTokenNotExpired as isTokenUnexpired } from 'src/utilities/tokens';
import { omit, sortBy } from 'lodash';
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

  // User operations.

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

  async verifyUserEmail(emailVerificationTokenString: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const emailVerificationTokenRepository = transactionalEntityManager.getRepository(EmailVerificationToken);
      const emailVerificationToken = await emailVerificationTokenRepository.findOne({ where: { token: emailVerificationTokenString }, relations: { user: true } });

      if (!emailVerificationToken) {
        throw new InvalidToken('Token not found');
      }

      const userRepository = transactionalEntityManager.getRepository(User);
      const user = emailVerificationToken.user;

      if (!user) {
        throw new InvalidToken('Token has no user');
      }

      if (!isTokenUnexpired(emailVerificationToken.createdAt, emailVerificationToken.ttl)) {
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
      const passwordResetToken = await passwordResetTokenRepository.findOne({ where: { token: passwordResetTokenString }, relations: { user: true } });

      if (!passwordResetToken) {
        throw new InvalidToken('Token not found');
      }

      const userRepository = transactionalEntityManager.getRepository(User);
      const user = passwordResetToken.user;

      if (!user) {
        throw new InvalidToken('Token has no user');
      }

      if (!isTokenUnexpired(passwordResetToken.createdAt, passwordResetToken.ttl)) {
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

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const userRepository = transactionalEntityManager.getRepository(User);
      const user = await userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new Error('User not found');
      }

      if (!await this.validatePassword(user.password, oldPassword)) {
        throw new InvalidCredentials('Invalid old password');
      }

      user.password = await this.hashUserPassword(newPassword);

      await userRepository.save(user);
    });
  }

  // Organization operations.

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

  // Knowledge base operations.

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

  // Resource operations.

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

  // Answer / chat operations

  async requestAnswer(question: string, knowledgeBaseId: string, reference: string) {
    return await this.answersService.addAnswerRequest(knowledgeBaseId, question, [], reference);
  }

  async requestAnswerForChatSession(
    question: string,
    knowledgeBaseId: string,
    chatSessionId: string,
    reference: string,
    language?: string,
    wisdomLevel?: string
  ) {
    // get chat session messages first
    const chatSession = await this.getChatSessionWithMessages(chatSessionId);

    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    const chatMessageRepository = AppDataSource.getRepository(ChatMessage);
    const userChatMessageId = uuidv4();
    const userChatMessageContent = {
      id: userChatMessageId,
      content: question,
      sender: 'USER' as SenderType,
      payload: {
        knowledgeBaseId,
        language,
        wisdomLevel
      }
    };

    const userChatMessage = new ChatMessage(userChatMessageContent);

    userChatMessage.chatSession = { id: chatSessionId } as ChatSession;

    await chatMessageRepository.save(userChatMessage);

    const sortedChatMessages = sortBy((chatSession?.chatMessages ?? []), properties<ChatMessage>().createdAt);
    const messages = sortedChatMessages.map((chatMessage) => {
      return {
        sender: chatMessage.sender,
        content: chatMessage.content
      };
    });

    const answer = await this.answersService.addAnswerRequest(knowledgeBaseId, question, messages, reference, language, wisdomLevel);
    const aiChatMessage = new ChatMessage({
      id: uuidv4(),
      content: answer.answer,
      sender: 'AI_ENGINE',
      payload: {
        knowledgeBaseId,
        sources: answer.sources,
        questionMessageId: userChatMessageId,
        language,
        wisdomLevel
      }
    });

    aiChatMessage.chatSession = { id: chatSessionId } as ChatSession;

    await chatMessageRepository.save(aiChatMessage);

    chatSession.metadata = {
      lastUserMessage: userChatMessageContent
    };

    chatSession.updatedAt = new Date();

    const chatSessionRepository = AppDataSource.getRepository(ChatSession);

    delete chatSession.chatMessages;

    await chatSessionRepository.save(chatSession);

    return answer;
  }

  async createChatSession(userId: string) {
    const chatSessionRepository = AppDataSource.getRepository(ChatSession);
    const chatSession = new ChatSession({
      id: uuidv4(),
      metadata: {}
    });

    chatSession.user = { id: userId } as User;

    await chatSessionRepository.save(chatSession);

    return omit(chatSession, [properties<ChatSession>().user]) as ChatSession;
  }

  async getUserChatSessions(userId: string) {
    const chatSessionRepository = AppDataSource.getRepository(ChatSession);

    return chatSessionRepository.find({ where: { user: { id: userId } } });
  }

  async getChatSession(chatSessionId: string) {
    const chatSessionRepository = AppDataSource.getRepository(ChatSession);

    return await chatSessionRepository.findOne({ where: { id: chatSessionId } });
  }

  async getChatSessionsByUser(userId: string, beforeDate: string | undefined) {
    const chatSessionRepository = AppDataSource.getRepository(ChatSession);

    return await chatSessionRepository.find({
      where: {
        user: { id: userId },
        ...beforeDate ? { updatedAt: LessThan(new Date(beforeDate)) } : {}
      },
      order: { updatedAt: 'DESC' },
      take: 20
    });
  }

  async getChatSessionWithMessages(chatSessionId: string) {
    const chatSessionRepository = AppDataSource.getRepository(ChatSession);

    return await chatSessionRepository.findOne({ where: { id: chatSessionId }, relations: { chatMessages: true } });
  }

  async getMessageWithChatSession(messageId: string) {
    const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

    return await chatMessageRepository.findOne({ where: { id: messageId }, relations: { chatSession: true } });
  }

  async deleteChatSession(chatSessionId: string) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const chatMessageRepository = transactionalEntityManager.getRepository(ChatMessage);
      const chatSessionRepository = transactionalEntityManager.getRepository(ChatSession);

      await chatMessageRepository.delete({ chatSession: { id: chatSessionId } as ChatSession });
      await chatSessionRepository.delete({ id: chatSessionId });
    });
  }

  async retrieveAnswerSources(messageId: string) {
    const chatMessageRepository = AppDataSource.getRepository(ChatMessage);
    const chatMessage = await chatMessageRepository.findOne({ where: { id: messageId } });

    if (!chatMessage) {
      throw new Error('Chat message not found');
    }

    const { knowledgeBaseId, sources } = chatMessage.payload;

    return await this.answersService.retrieveSourcesData(knowledgeBaseId, sources ?? []);
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

export class InvalidCredentials extends Error {
  constructor(message: string | undefined) {
    super(message);
  }
}


export const applicationOperations = new ApplicationOperations(knowledgeBaseIntelligenceService, answersIntelligenceService, emailService);
