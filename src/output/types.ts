export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  createdUtc: number;
  selftext: string;
  linkFlairText: string | null;
}

export interface PainPoint {
  post: RedditPost;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface OutputMetadata {
  timestamp: string;
  source: string;
  subreddit: string;
  totalResults: number;
}

export interface FormattedOutput {
  metadata: OutputMetadata;
  painPoints: PainPoint[];
}

export interface FormatOptions {
  pretty: boolean;
}

export interface WriteOptions {
  encoding?: BufferEncoding;
}
