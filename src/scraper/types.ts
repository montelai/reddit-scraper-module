export interface Post {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  url: string;
  created: Date;
  body?: string;
  numComments?: number;
  permalink?: string;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  score: number;
  created: Date;
  parentId?: string;
  replies?: Comment[];
  isSubmitter?: boolean;
}

export interface Subreddit {
  name: string;
  displayName: string;
  subscribers?: number;
  description?: string;
  publicDescription?: string;
}

export type SortType = 'hot' | 'new' | 'top' | 'rising';

export interface PostScraperOptions {
  subreddit: string;
  sort?: SortType;
  limit?: number;
  after?: string;
  before?: string;
}

export interface CommentScraperOptions {
  postId: string;
  subreddit?: string;
  limit?: number;
  depth?: number;
}

export interface SearchScraperOptions {
  query: string;
  subreddit?: string;
  sort?: SortType;
  limit?: number;
  after?: string;
  before?: string;
}

export interface PaginationInfo {
  after?: string;
  before?: string;
  count?: number;
}

export interface ScraperResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface RedditErrorResponse {
  error: number;
  message: string;
}
