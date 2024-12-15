

/*
 * Module dependencies.
 */

import config from 'src/config';
import fetch from 'node-fetch';
import logger from 'src/logger';


/*
 * Recaptcha service.
 */

export class RecaptchaService {

  secretKey: string;
  projectNumber: string;


  constructor(secretKey: string, projectNumber: string) {
    this.secretKey = secretKey;
    this.projectNumber = projectNumber;
  }

  async verify(token: string) {
    console.log(token, this.secretKey);
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${this.secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      logger.error('The Assessment token is not valid.');
    }

    return data.score > 0.6;
  }
}

export const recaptchaService = new RecaptchaService(config.recaptcha.key, config.recaptcha.projectNumber);
