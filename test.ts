import { createRedditScraper } from './src';

async function test() {
  console.log('Testing Reddit Scraper Module...\n');

  const scraper = createRedditScraper();

  try {
    console.log('1. Testing post scraping from r/programming...');
    const posts = await scraper.posts.scrape({
      subreddit: 'programming',
      sort: 'hot',
      limit: 5,
    });
    
    console.log(`   Found ${posts.data.length} posts`);
    if (posts.data.length > 0) {
      console.log(`   First post: "${posts.data[0].title}" by u/${posts.data[0].author}`);
    }
    console.log('');

    console.log('2. Testing search functionality...');
    const searchResults = await scraper.search.search({
      query: 'typescript',
      limit: 5,
    });
    
    console.log(`   Found ${searchResults.data.length} posts`);
    if (searchResults.data.length > 0) {
      console.log(`   First result: "${searchResults.data[0].title}"`);
    }
    console.log('');

    console.log('3. Testing comment scraping...');
    if (posts.data.length > 0 && posts.data[0].id) {
      const comments = await scraper.comments.scrape({
        postId: posts.data[0].id,
        subreddit: 'programming',
        limit: 10,
      });
      
      console.log(`   Found ${comments.data.length} comments`);
      if (comments.data.length > 0) {
        console.log(`   First comment by: u/${comments.data[0].author}`);
      }
    }
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
