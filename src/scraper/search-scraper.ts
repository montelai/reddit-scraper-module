import { RedditClient } from './reddit-client';
import { Post, SearchScraperOptions, SortType, ScraperResponse, PaginationInfo } from './types';

interface RedditPostData {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  url: string;
  created_utc: number;
  selftext?: string;
  num_comments?: number;
  permalink?: string;
  name: string;
}

interface RedditSearchResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditPostData;
    }>;
    after?: string;
    before?: string;
  };
}

export class SearchScraper {
  constructor(private client: RedditClient) {}

  private mapRedditPostToPost(redditPost: RedditPostData): Post {
    return {
      id: redditPost.id,
      title: redditPost.title,
      author: redditPost.author || '[deleted]',
      subreddit: redditPost.subreddit,
      score: redditPost.score,
      url: redditPost.url,
      created: new Date(redditPost.created_utc * 1000),
      body: redditPost.selftext,
      numComments: redditPost.num_comments,
      permalink: redditPost.permalink,
    };
  }

  async search(options: SearchScraperOptions): Promise<ScraperResponse<Post>> {
    const {
      query,
      subreddit,
      sort = 'relevance',
      limit = 25,
      after,
      before,
    } = options;

    let endpoint: string;
    if (subreddit) {
      endpoint = `/r/${subreddit}/search.json`;
    } else {
      endpoint = '/search.json';
    }

    const params: Record<string, any> = {
      q: query,
      restrict_sr: subreddit ? 1 : 0,
      sort: sort,
      limit: Math.min(limit, 100),
      type: 'link',
    };

    if (after) params.after = after;
    if (before) params.before = before;

    const response = await this.client.getPaginated<RedditSearchResponse>(
      endpoint,
      params
    );

    const posts = response.data.children
      .filter(child => child.kind === 't3')
      .map(child => this.mapRedditPostToPost(child.data));

    const pagination: PaginationInfo = {
      after: response.data.after,
      before: response.data.before,
      count: posts.length,
    };

    return {
      data: posts,
      pagination,
    };
  }

  async searchAll(
    options: SearchScraperOptions,
    maxResults: number = 100
  ): Promise<Post[]> {
    const allPosts: Post[] = [];
    let currentOptions = { ...options };
    let resultCount = 0;

    while (resultCount < maxResults) {
      const remaining = maxResults - resultCount;
      currentOptions.limit = Math.min(remaining, 100);

      const response = await this.search(currentOptions);

      if (response.data.length === 0) {
        break;
      }

      allPosts.push(...response.data);
      resultCount += response.data.length;

      if (!response.pagination.after) {
        break;
      }

      currentOptions.after = response.pagination.after;
    }

    return allPosts;
  }
}

export const createSearchScraper = (client: RedditClient): SearchScraper => {
  return new SearchScraper(client);
};
