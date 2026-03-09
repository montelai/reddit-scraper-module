<<<<<<< HEAD
// Reddit Scraper Exports
=======
>>>>>>> origin/reddit-scraper-module
export * from './scraper/types';
export { RedditClient, createRedditClient } from './scraper/reddit-client';
export { PostScraper, createPostScraper } from './scraper/post-scraper';
export { CommentScraper, createCommentScraper } from './scraper/comment-scraper';
export { SearchScraper, createSearchScraper } from './scraper/search-scraper';

<<<<<<< HEAD
// JSON Output Exports
export * from './output';

=======
>>>>>>> origin/reddit-scraper-module
import { createRedditClient } from './scraper/reddit-client';
import { createPostScraper } from './scraper/post-scraper';
import { createCommentScraper } from './scraper/comment-scraper';
import { createSearchScraper } from './scraper/search-scraper';
import { RedditClient } from './scraper/reddit-client';
import { PostScraper } from './scraper/post-scraper';
import { CommentScraper } from './scraper/comment-scraper';
import { SearchScraper } from './scraper/search-scraper';

export class RedditScraper {
  public readonly client: RedditClient;
  public readonly posts: PostScraper;
  public readonly comments: CommentScraper;
  public readonly search: SearchScraper;

  constructor(baseURL?: string) {
    this.client = createRedditClient(baseURL);
    this.posts = createPostScraper(this.client);
    this.comments = createCommentScraper(this.client);
    this.search = createSearchScraper(this.client);
  }
}

export const createRedditScraper = (baseURL?: string): RedditScraper => {
  return new RedditScraper(baseURL);
};
