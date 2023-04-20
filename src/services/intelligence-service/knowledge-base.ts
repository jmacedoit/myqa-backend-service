
/*
 * Knowledge base intelligence Service.
 */

import FormData from 'form-data';
import config from 'src/config';
import fetch from 'node-fetch';

/*
 * Knowledge base intelligence Service.
 */

export class KnowledgeBaseIntelligenceService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async assimilateResource(knowledgeBaseId: string, resourceId: string, file: Buffer, fileName: string) {
    const url = `${this.baseUrl}/knowledge-base/${knowledgeBaseId}/resource/${resourceId}`;
    const formData = new FormData();

    formData.append('file', file, fileName);

    const response = await fetch(url, {
      method: 'POST',
      body: formData as any,
    });

    if (!response.ok) {
      throw new Error(`Error assimilating resource: ${response.statusText}`);
    }
  }

  async removeResource(knowledgeBaseId: string, resourceId: string) {
    const url = `${this.baseUrl}/knowledge-base/${knowledgeBaseId}/resource/${resourceId}`;
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`Error removing resource: ${response.statusText}`);
    }

    return await response.text();
  }

  async removeKnowledgeBase(knowledgeBaseId: string) {
    const url = `${this.baseUrl}/knowledge-base/${knowledgeBaseId}`;

    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`Error removing knowledge base: ${response.statusText}`);
    }

    return await response.text();
  }
}

export const knowledgeBaseIntelligenceService = new KnowledgeBaseIntelligenceService(config.intelligenceService.url);
