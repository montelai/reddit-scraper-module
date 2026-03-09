import { FormattedOutput, PainPoint, FormatOptions } from './types';

export function formatJSON(
  painPoints: PainPoint[],
  subreddit: string,
  options: FormatOptions = { pretty: true }
): string {
  const output: FormattedOutput = {
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'reddit-scraper',
      subreddit,
      totalResults: painPoints.length,
    },
    painPoints,
  };

  return options.pretty
    ? JSON.stringify(output, null, 2)
    : JSON.stringify(output);
}

export function formatForTerminal(data: FormattedOutput): string {
  const lines: string[] = [];

  lines.push('═'.repeat(60));
  lines.push('Reddit Pain Points Analysis');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`Timestamp: ${data.metadata.timestamp}`);
  lines.push(`Source: ${data.metadata.source}`);
  lines.push(`Subreddit: r/${data.metadata.subreddit}`);
  lines.push(`Total Results: ${data.metadata.totalResults}`);
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('');

  data.painPoints.forEach((point, index) => {
    lines.push(`[${index + 1}] ${point.post.title}`);
    lines.push(`    Author: u/${point.post.author}`);
    lines.push(`    Score: ${point.post.score} | Comments: ${point.post.numComments}`);
    lines.push(`    Relevance: ${point.relevanceScore.toFixed(2)}`);
    lines.push(`    Keywords: ${point.matchedKeywords.join(', ')}`);
    lines.push(`    URL: https://reddit.com${point.post.permalink}`);
    lines.push('');
  });

  lines.push('═'.repeat(60));

  return lines.join('\n');
}
