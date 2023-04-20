
/*
 * Module dependencies.
 */

import config from 'src/config';
import fetch from 'node-fetch';

/*
 * Answers intelligence Service.
 */

export class AnswersIntelligenceService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async addAnswerRequest(knowledgeBaseId: string, question: string) {
    const url = `${this.baseUrl}/answer-request`;
    const requestBody = {
      knowledgeBaseId,
      question,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error adding answer request: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const answersIntelligenceService = new AnswersIntelligenceService(config.intelligenceService.url);
