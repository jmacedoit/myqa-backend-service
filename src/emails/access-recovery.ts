
/**
 * Module dependencies.
 */

import { body, button, email, text, title } from './building-blocks';
import { stripHtml } from 'string-strip-html';
import config from 'src/config';


/*
 * Email copy.
 */

type EmailCopy = {
  subject: string,
  title: string,
  message: string,
  messageAfterLink: string,
  buttonText: string
}

function getPasswordResetEmailTranslations(userDisplayName: string, language: string): EmailCopy {
  const emailTranslations: { [key: string]: EmailCopy } = {
    en: {
      subject: 'Reset your password',
      title: `Hello ${userDisplayName},`,
      message: 'We received a request to reset the password for your account. To proceed with the password redefinition process, please click the link below. If you did not request this, you can safely ignore this email.',
      messageAfterLink: 'Best regards,<br/>Myqa team',
      buttonText: 'Reset password',
    }
  };

  return emailTranslations[language];
}

function getPasswordResetConfirmationEmailTranslations(userDisplayName: string, language: string): Omit<EmailCopy, 'buttonText'> {
  const emailTranslations: { [key: string]: Omit<EmailCopy, 'buttonText'> } = {
    en: {
      subject: 'Your password has been reset',
      title: `Hello ${userDisplayName},`,
      message: 'This is a confirmation that the password for your account has just been changed. You can now sign in with your new password.',
      messageAfterLink: 'Best regards,<br/>Myqa team'
    }
  };

  return emailTranslations[language];
}

export function createPasswordResetEmail(data: { userEmail: string, userDisplayName: string, token: string, language: string }) {
  const { userEmail, userDisplayName, token, language } = data;
  const userDisplayNameRegex = /[^a-zA-Z0-9 ]/g;
  const userDisplayNameClean = userDisplayName.replace(userDisplayNameRegex, '');
  const emailTranslation = getPasswordResetEmailTranslations(userDisplayNameClean, language);

  const emailData = {
    to: userEmail,
    from: {
      email: config.sendgrid.senderEmail,
      name: config.sendgrid.senderName
    },
    subject: emailTranslation.subject,
    html: email(
      body(
        title(emailTranslation.title) +
        text(emailTranslation.message) +
        button(emailTranslation.buttonText, config.publicUri + config.passwordReset.route + '?token=' + token, false) +
        text(emailTranslation.messageAfterLink)
      )
    ),
    text: emailTranslation.title + '\n\n' + stripHtml(emailTranslation.message) + '\n\n' + emailTranslation.buttonText + ': ' + config.publicUri + config.emailVerification.route + '?token=' + token + '\n\n' + stripHtml(emailTranslation.messageAfterLink)
  };

  return emailData;
}

export function createPasswordResetConfirmationEmail(data: { userEmail: string, userDisplayName: string, language: string }) {
  const { userEmail, userDisplayName, language } = data;
  const userDisplayNameRegex = /[^a-zA-Z0-9 ]/g;
  const userDisplayNameClean = userDisplayName.replace(userDisplayNameRegex, '');
  const emailTranslation = getPasswordResetConfirmationEmailTranslations(userDisplayNameClean, language);

  const emailData = {
    to: userEmail,
    from: {
      email: config.sendgrid.senderEmail,
      name: config.sendgrid.senderName
    },
    subject: emailTranslation.subject,
    html: email(
      body(
        title(emailTranslation.title) +
        text(emailTranslation.message) +
        text(emailTranslation.messageAfterLink)
      )
    ),
    text: emailTranslation.title + '\n\n' + stripHtml(emailTranslation.message) + '\n\n' + stripHtml(emailTranslation.messageAfterLink)
  };

  return emailData;
}
