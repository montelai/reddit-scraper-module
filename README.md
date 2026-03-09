# Reddit JSON Output Formatter

A TypeScript module for formatting Reddit scraper results as JSON.

## Features

- Format pain points as JSON with pretty/compact options
- Write output to files (async/sync)
- Terminal-friendly output formatting
- Metadata tracking (timestamp, source, subreddit, count)
- Full TypeScript support with strict type checking

## Installation

```bash
yarn install
```

## Usage

```typescript
import {
  formatJSON,
  writeToFile,
  formatForTerminal,
  RedditPost,
  PainPoint
} from './src/output';

// Create a pain point
const post: RedditPost = {
  id: 'abc123',
  title: 'Looking for feedback on my startup idea',
  author: 'entrepreneur123',
  subreddit: 'startups',
  url: 'https://reddit.com/r/startups/comments/abc123',
  permalink: '/r/startups/comments/abc123',
  score: 42,
  numComments: 15,
  createdUtc: Date.now() / 1000,
  selftext: 'I have an idea for...',
  linkFlairText: 'Feedback'
};

const painPoint: PainPoint = {
  post,
  relevanceScore: 0.85,
  matchedKeywords: ['startup', 'feedback', 'idea']
};

// Format as JSON
const json = formatJSON([painPoint], 'startups', { pretty: true });
console.log(json);

// Write to file
await writeToFile(json, 'output/pain-points.json');

// Format for terminal
const terminal = formatForTerminal(JSON.parse(json));
console.log(terminal);
```

## API

### `formatJSON(painPoints, subreddit, options?)`

Format pain points as JSON string.

- `painPoints`: Array of PainPoint objects
- `subreddit`: Subreddit name
- `options.pretty`: Boolean for pretty printing (default: true)

### `writeToFile(data, filePath, options?)`

Write data to a file (async).

- `data`: String or FormattedOutput object
- `filePath`: Output file path
- `options.encoding`: File encoding (default: 'utf-8')

### `writeToFileSync(data, filePath, options?)`

Write data to a file (sync).

### `formatForTerminal(data)`

Format output for terminal display.

## Build

```bash
yarn build
```

## Type Check

```bash
yarn typecheck
```
