
/*
 * Module dependencies.
 */

import { merge } from 'lodash';
import fetch, { RequestInfo, RequestInit} from 'node-fetch';

/*
 * Fetch wrapper that handles errors.
 */

export async function easyFetch(url: RequestInfo, init ?: RequestInit): Promise<unknown> {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(url, merge(defaultOptions, init || {}));

  let responseBody = {};

  try {
    responseBody = await response.json();
  } catch (error) {
    // Do nothing
  }

  if (!response.ok) {
    throw new Error(`Request error with status ${response.status} - ${JSON.stringify(responseBody, null, 2)}`);
  }

  return responseBody;
}
