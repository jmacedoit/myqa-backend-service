
/*
 * Module dependencies.
 */

import { SenderType } from 'src/models/chat-message';
import { isEmpty, isNil } from 'lodash';
import config from 'src/config';
import fetch from 'node-fetch';

/*
 * Types.
 */

export type ConversationEntry = {
  content: string,
  sender: SenderType
};

export type Source = {
  chunkId: string,
  chunkNumber: number,
  fileName: string,
  pageIndex: number,
  percentageIn: number,
  resourceMimetype: string,
  resourceName: string
};

export type SourceData = {
  chunkId: string,
  data: string
};

/*
 * Answers intelligence Service.
 */

export class AnswersIntelligenceService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async addAnswerRequest(
    knowledgeBaseId: string,
    question: string,
    conversation: ConversationEntry[],
    reference: string,
    language?: string,
    wisdomLevel?: string
  ): Promise<{ answer: string, sources: Source[] }> {
    const url = `${this.baseUrl}/answer-request`;
    const requestBody = {
      'knowledge_base_id': knowledgeBaseId,
      question,
      reference,
      ...(isNil(conversation) || isEmpty(conversation)) ? {} : { conversation: conversation.slice(0, 10) },
      ...(isNil(language) || isEmpty(language)) ? {} : { language },
      ...(isNil(wisdomLevel) || isEmpty(wisdomLevel)) ? {} : { 'wisdom_level': wisdomLevel }
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

    const responseContent = await response.json() as unknown as {
      answer: string,
      sources: Array<{
        chunk_id: string,
        chunk_number: number,
        file_name: string,
        page_index: number,
        percentage_in: number,
        resource_mimetype: string,
        resource_name: string
      }>
    };

    return {
      answer: responseContent.answer,
      sources: responseContent.sources.map(source => ({
        chunkId: source.chunk_id,
        chunkNumber: source.chunk_number,
        fileName: source.file_name,
        pageIndex: source.page_index,
        percentageIn: source.percentage_in,
        resourceMimetype: source.resource_mimetype,
        resourceName: source.resource_name
      }))
    };
  }

  async retrieveSourcesData(knowledgeBaseId: string, sources: { chunkId: string }[]) {
    const url = `${this.baseUrl}/chunks-retrieval`;
    const requestBody = {
      'knowledge_base_id': knowledgeBaseId,
      'chunk_ids': sources.map(source => source.chunkId)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error retrieving sources: ${response.statusText}`);
    }

    const responseContent = (await response.json()) as unknown as {
      chunks_data: Array<{
        id: string,
        data: string
      }>
    };

    return responseContent.chunks_data.map(source => ({
      chunkId: source.id,
      data: source.data
    }));
  }
}

export const answersIntelligenceService = new AnswersIntelligenceService(config.intelligenceService.url);
