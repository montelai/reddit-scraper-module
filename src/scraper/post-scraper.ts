import { RedditClient } from './reddit-client';
import { Post, PostScraperOptions, SortType, ScraperResponse, PaginationInfo } from './types';

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

interface RedditListingResponse {
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

export class PostScraper {
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

  private buildEndpoint(subreddit: string, sort: SortType): string {
    const sortPaths: Record<SortType, string> = {
      hot: `/r/${subreddit}/hot.json`,
      new: `/r/${subreddit}/new.json`,
      top: `/r/${subreddit}/top.json`,
      rising: `/r/${subreddit}/rising.json`,
    };
    return sortPaths[sort];
  }

  async scrape(options: PostScraperOptions): Promise<ScraperResponse<Post>> {
    const {
      subreddit,
      sort = 'hot',
      limit = 25,
      after,
      before,
    } = options;

    const endpoint = this.buildEndpoint(subreddit, sort);
    
    const params: Record<string, any> = {
      limit: Math.min(limit, 100),
    };

    if (after) params.after = after;
    if (before) params.before = before;

    const response = await this.client.getPaginated<RedditListingResponse>(
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

  async scrapeAll(
    options: PostScraperOptions,
    maxPosts: number = 100
  ): Promise<Post[]> {
    const allPosts: Post[] = [];
    let currentOptions = { ...options };
    let postCount = 0;

    while (postCount < maxPosts) {
      const remaining = maxPosts - postCount;
      currentOptions.limit = Math.min(remaining, 100);

      const response = await this.scrape(currentOptions);
      
      if (response.data.length === 0) {
        break;
      }

      allPosts.push(...response.data);
      postCount += response.data.length;

      if (!response.pagination.after) {
        break;
      }

      currentOptions.after = response.pagination.after;
    }

    return allPosts;
  }
}

export const createPostScraper = (client: RedditClient): PostScraper => {
  return new PostScraper(client);
};
