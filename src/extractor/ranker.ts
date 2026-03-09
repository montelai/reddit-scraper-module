import { Post, RankedPost, Ranker } from './types';

const KEYWORD_MATCH_BONUS = 10;
const TITLE_MATCH_BONUS = 20;
const ADDITIONAL_KEYWORD_BONUS = 5;

export class RankerImpl implements Ranker {
  rank(post: Post, matchedKeywords: string[]): RankedPost {
    const relevanceScore = this.calculateRelevanceScore(post, matchedKeywords);

    return {
      post,
      relevanceScore,
      matchedKeywords,
    };
  }

  rankPosts(posts: Post[], matchedKeywordsMap: Map<Post, string[]>): RankedPost[] {
    const rankedPosts = posts.map((post) => {
      const keywords = matchedKeywordsMap.get(post) || [];
      return this.rank(post, keywords);
    });

    return rankedPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculateRelevanceScore(post: Post, matchedKeywords: string[]): number {
    let score = post.score;

    if (matchedKeywords.length === 0) {
      return score;
    }

    score += matchedKeywords.length * KEYWORD_MATCH_BONUS;

    const titleLower = post.title.toLowerCase();
    const titleMatches = matchedKeywords.filter((keyword) =>
      titleLower.includes(keyword)
    );
    if (titleMatches.length > 0) {
      score += TITLE_MATCH_BONUS;
    }

    if (matchedKeywords.length > 1) {
      score += (matchedKeywords.length - 1) * ADDITIONAL_KEYWORD_BONUS;
    }

    return score;
  }
}

export function createRanker(): RankerImpl {
  return new RankerImpl();
}
