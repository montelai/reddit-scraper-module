import { Post, PainFilter } from './types';
import { KeywordManagerImpl, createKeywordManager } from './keyword-manager';

export class PainFilterImpl implements PainFilter {
  private keywordManager: KeywordManagerImpl;

  constructor(keywords?: string[]) {
    this.keywordManager = createKeywordManager(keywords);
  }

  filter(posts: Post[]): Post[] {
    return posts.filter((post) => this.matchesAnyKeyword(post));
  }

  setKeywords(keywords: string[]): void {
    this.keywordManager.setKeywords(keywords);
  }

  findMatchingKeywords(post: Post): string[] {
    const matchedKeywords: string[] = [];
    const textToSearch = this.getSearchableText(post);

    for (const keyword of this.keywordManager.listKeywords()) {
      if (textToSearch.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }

    return matchedKeywords;
  }

  private matchesAnyKeyword(post: Post): boolean {
    const textToSearch = this.getSearchableText(post);

    for (const keyword of this.keywordManager.listKeywords()) {
      if (textToSearch.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  private getSearchableText(post: Post): string {
    return `${post.title} ${post.body}`.toLowerCase();
  }

  getKeywordManager(): KeywordManagerImpl {
    return this.keywordManager;
  }
}

export function createPainFilter(keywords?: string[]): PainFilterImpl {
  return new PainFilterImpl(keywords);
}
