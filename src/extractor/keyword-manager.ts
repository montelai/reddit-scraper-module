import { KeywordManager } from './types';

const DEFAULT_PAIN_KEYWORDS = [
  'hate',
  'frustrated',
  'annoying',
  'wish there was',
  'is there a tool',
  'how do I',
  'struggle',
  'manual',
  'time consuming',
  'pain point',
  'any way to',
  'workaround',
  'hack',
  'better way',
  'sick of',
  'tired of',
  'why is this so hard',
  'need help with',
  'looking for solution',
];

export class KeywordManagerImpl implements KeywordManager {
  private keywords: Set<string>;

  constructor(initialKeywords?: string[]) {
    this.keywords = new Set(initialKeywords || DEFAULT_PAIN_KEYWORDS);
  }

  addKeyword(keyword: string): void {
    const normalized = keyword.toLowerCase().trim();
    if (normalized) {
      this.keywords.add(normalized);
    }
  }

  removeKeyword(keyword: string): void {
    const normalized = keyword.toLowerCase().trim();
    this.keywords.delete(normalized);
  }

  listKeywords(): string[] {
    return Array.from(this.keywords).sort();
  }

  setKeywords(keywords: string[]): void {
    this.keywords = new Set(
      keywords.map((k) => k.toLowerCase().trim()).filter((k) => k.length > 0)
    );
  }

  hasKeyword(keyword: string): boolean {
    return this.keywords.has(keyword.toLowerCase().trim());
  }

  getKeywords(): Set<string> {
    return new Set(this.keywords);
  }
}

export function createKeywordManager(initialKeywords?: string[]): KeywordManagerImpl {
  return new KeywordManagerImpl(initialKeywords);
}

export { DEFAULT_PAIN_KEYWORDS };
