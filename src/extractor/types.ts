export interface Post {
  title: string;
  body: string;
  subreddit: string;
  score: number;
  url: string;
}

export interface RankedPost {
  post: Post;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface KeywordManager {
  addKeyword(keyword: string): void;
  removeKeyword(keyword: string): void;
  listKeywords(): string[];
  setKeywords(keywords: string[]): void;
}

export interface PainFilter {
  filter(posts: Post[]): Post[];
  setKeywords(keywords: string[]): void;
}

export interface Ranker {
  rank(post: Post, matchedKeywords: string[]): RankedPost;
}
