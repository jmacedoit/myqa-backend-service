

/*
 * Module dependencies.
 */

import { createEmailVerificationEmail } from 'src/emails/email-verification';
import { createPasswordResetEmail } from 'src/emails/password-reset';
import config from 'src/config';
import sendgridMail from '@sendgrid/mail';

/*
 * Email service.
 */

export class EmailService {

  constructor() {
    sendgridMail.setApiKey(config.sendgrid.apiKey);
  }

  async sendEmailVerificationEmail(data: { userEmail: string, userDisplayName: string, token: string, language: string }) {
    const emailData = createEmailVerificationEmail(data);

    await sendgridMail.send(emailData);
  }

  async sendPasswordResetEmail(data: { userEmail: string, userDisplayName: string, token: string, language: string }) {
    const emailData = createPasswordResetEmail(data);

    await sendgridMail.send(emailData);
  }

  async sendPasswordResetConfirmationEmail(data: { userEmail: string, userDisplayName: string, language: string }) {
    const emailData = createPasswordResetConfirmationEmail(data);

    await sendgridMail.send(emailData);
  }
}

export const emailService = new EmailService();
