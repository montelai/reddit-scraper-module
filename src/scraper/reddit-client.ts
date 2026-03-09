import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RedditErrorResponse } from './types';

export class RedditClient {
  private client: AxiosInstance;
  private lastRequestTime: number = 0;
  private readonly rateLimitDelay: number = 2000;
  private readonly maxRetries: number = 3;

  constructor(baseURL: string = 'https://www.reddit.com') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'RedditScraperModule/1.0.0',
        'Accept': 'application/json',
      },
    });
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delayNeeded = this.rateLimitDelay - timeSinceLastRequest;
      await this.sleep(delayNeeded);
    }
    
    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRateLimited(error: any): boolean {
    return error.response?.status === 429;
  }

  private isServiceUnavailable(error: any): boolean {
    return error.response?.status === 503;
  }

  private isRedditError(data: any): data is RedditErrorResponse {
    return data && typeof data.error === 'number' && typeof data.message === 'string';
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.enforceRateLimit();
        
        const response = await this.client.get<T>(endpoint, config);
        
        if (this.isRedditError(response.data)) {
          throw new Error(`Reddit API Error: ${response.data.message}`);
        }
        
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        if (this.isRateLimited(error)) {
          throw new Error('Rate limit exceeded (429). Please reduce request frequency.');
        }
        
        if (this.isServiceUnavailable(error) && attempt < this.maxRetries) {
          const backoffTime = this.rateLimitDelay * attempt;
          await this.sleep(backoffTime);
          continue;
        }
        
        if (attempt === this.maxRetries) {
          throw new Error(`Request failed after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error('Request failed');
  }

  async getPaginated<T>(
    endpoint: string,
    params: Record<string, any> = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.get<T>(endpoint, {
      ...config,
      params: {
        ...params,
        raw_json: 1,
      },
    });
  }
}

export const createRedditClient = (baseURL?: string): RedditClient => {
  return new RedditClient(baseURL);
};
