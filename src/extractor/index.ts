import { Post, RankedPost } from './types';
import { PainFilterImpl, createPainFilter } from './pain-filter';
import { RankerImpl, createRanker } from './ranker';
import { KeywordManagerImpl, createKeywordManager, DEFAULT_PAIN_KEYWORDS } from './keyword-manager';

export { Post, RankedPost, KeywordManager, PainFilter, Ranker } from './types';
export { createPainFilter, PainFilterImpl } from './pain-filter';
export { createRanker, RankerImpl } from './ranker';
export { createKeywordManager, KeywordManagerImpl, DEFAULT_PAIN_KEYWORDS } from './keyword-manager';

export class PainExtractor {
  private filter: PainFilterImpl;
  private ranker: RankerImpl;

  constructor(keywords?: string[]) {
    this.filter = createPainFilter(keywords);
    this.ranker = createRanker();
  }

  extract(posts: Post[]): RankedPost[] {
    const filteredPosts = this.filter.filter(posts);

    const matchedKeywordsMap = new Map<Post, string[]>();
    for (const post of filteredPosts) {
      const matchedKeywords = this.filter.findMatchingKeywords(post);
      matchedKeywordsMap.set(post, matchedKeywords);
    }

    return this.ranker.rankPosts(filteredPosts, matchedKeywordsMap);
  }

  setKeywords(keywords: string[]): void {
    this.filter.setKeywords(keywords);
  }

  addKeyword(keyword: string): void {
    this.filter.getKeywordManager().addKeyword(keyword);
  }

  removeKeyword(keyword: string): void {
    this.filter.getKeywordManager().removeKeyword(keyword);
  }

  listKeywords(): string[] {
    return this.filter.getKeywordManager().listKeywords();
  }
}

export function createPainExtractor(keywords?: string[]): PainExtractor {
  return new PainExtractor(keywords);
}
