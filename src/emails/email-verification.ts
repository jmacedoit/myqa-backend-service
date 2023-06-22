
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
  buttonText: string,
}

function getEmailTranslations(userDisplayName: string, language: string): EmailCopy {
  const emailTranslations: { [key: string]: EmailCopy } = {
    en: {
      subject: 'Verify your email',
      title: `Hello ${userDisplayName},`,
      message: 'Thank you for signing up for our platform! We are excited to have you on board. To ensure the security of your account and activate your membership, we kindly request that you verify your email address. <br/>To confirm your email, simply click on the verification link provided below',
      messageAfterLink: 'Best regards,<br/>Myqa team',
      buttonText: 'Verify email',
    }
  };

  return emailTranslations[language];
}


export function createEmailVerificationEmail(data: { userEmail: string, userDisplayName: string, token: string, language: string }) {
  const { userEmail, userDisplayName, token, language } = data;
  const userDisplayNameRegex = /[^a-zA-Z0-9 ]/g;
  const userDisplayNameClean = userDisplayName.replace(userDisplayNameRegex, '');
  const emailTranslation = getEmailTranslations(userDisplayNameClean, language);

  const emailData = {
    to: userEmail,
    from: config.sendgrid.senderEmail,
    subject: emailTranslation.subject,
    html: email(
      body(
        title(emailTranslation.title) +
        text(emailTranslation.message) +
        button(emailTranslation.buttonText, config.publicUri + config.emailVerification.route + '?token=' + token, false) +
        text(emailTranslation.messageAfterLink)
      )
    ),
    text: emailTranslation.title + '\n\n' + stripHtml(emailTranslation.message) + '\n\n' + emailTranslation.buttonText + ': ' + config.publicUri + config.emailVerification.route + '?token=' + token + '\n\n' + stripHtml(emailTranslation.messageAfterLink)
  };

  return emailData;
}
