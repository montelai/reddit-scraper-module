import { RedditClient } from './reddit-client';
import { Comment, CommentScraperOptions, ScraperResponse, PaginationInfo } from './types';

interface RedditCommentData {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  parent_id?: string;
  is_submitter?: boolean;
  replies?: RedditListingResponse | string;
  kind: string;
}

interface RedditListingResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditCommentData | any;
    }>;
    after?: string;
    before?: string;
  };
}

export class CommentScraper {
  constructor(private client: RedditClient) {}

  private mapRedditCommentToComment(redditComment: RedditCommentData, depth: number = 0): Comment {
    const comment: Comment = {
      id: redditComment.id,
      author: redditComment.author || '[deleted]',
      body: redditComment.body || '[deleted]',
      score: redditComment.score,
      created: new Date(redditComment.created_utc * 1000),
      parentId: redditComment.parent_id,
      isSubmitter: redditComment.is_submitter,
      replies: [],
    };

    if (redditComment.replies && typeof redditComment.replies !== 'string') {
      comment.replies = this.processCommentChildren(
        redditComment.replies.data.children,
        depth + 1
      );
    }

    return comment;
  }

  private processCommentChildren(
    children: Array<{ kind: string; data: RedditCommentData }>,
    depth: number
  ): Comment[] {
    return children
      .filter(child => child.kind === 't1')
      .map(child => this.mapRedditCommentToComment(child.data, depth));
  }

  async scrape(options: CommentScraperOptions): Promise<ScraperResponse<Comment>> {
    const {
      postId,
      subreddit,
      limit = 100,
      depth,
    } = options;

    let endpoint: string;
    if (subreddit) {
      endpoint = `/r/${subreddit}/comments/${postId}.json`;
    } else {
      endpoint = `/comments/${postId}.json`;
    }

    const params: Record<string, any> = {
      limit: Math.min(limit, 500),
    };

    if (depth !== undefined) {
      params.depth = depth;
    }

    const response = await this.client.getPaginated<RedditListingResponse[]>(
      endpoint,
      params
    );

    if (!Array.isArray(response) || response.length < 2) {
      return {
        data: [],
        pagination: {},
      };
    }

    const commentsListing = response[1];
    const comments = this.processCommentChildren(
      commentsListing.data.children,
      0
    );

    const pagination: PaginationInfo = {
      after: commentsListing.data.after,
      before: commentsListing.data.before,
      count: comments.length,
    };

    return {
      data: comments,
      pagination,
    };
  }

  async scrapeAll(options: CommentScraperOptions): Promise<Comment[]> {
    const response = await this.scrape(options);
    return response.data;
  }

  flattenComments(comments: Comment[]): Comment[] {
    const flattened: Comment[] = [];

    const flatten = (commentList: Comment[]) => {
      for (const comment of commentList) {
        flattened.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          flatten(comment.replies);
        }
      }
    };

    flatten(comments);
    return flattened;
  }
}

export const createCommentScraper = (client: RedditClient): CommentScraper => {
  return new CommentScraper(client);
};
