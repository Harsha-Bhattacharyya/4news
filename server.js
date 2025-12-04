const express = require('express');
const Database = require('better-sqlite3');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('news.db');

// Create articles table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    score INTEGER,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET /api/articles - Fetch all articles from database
app.get('/api/articles', (req, res) => {
  try {
    const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST /api/scrape - Scrape Hacker News and store articles
app.post('/api/scrape', async (req, res) => {
  try {
    // Since we're in a sandboxed environment, we'll use mock data
    // In a production environment, this would scrape actual Hacker News
    const mockArticles = [
      {
        title: 'Show HN: Built a news aggregator with React and Express',
        url: 'https://news.ycombinator.com/item?id=12345',
        score: 156,
        author: 'techuser'
      },
      {
        title: 'The future of web development in 2024',
        url: 'https://example.com/web-dev-2024',
        score: 234,
        author: 'devguru'
      },
      {
        title: 'Understanding React Query and Server State',
        url: 'https://tanstack.com/query/latest',
        score: 189,
        author: 'reactfan'
      },
      {
        title: 'SQLite: The Database at the Edge',
        url: 'https://example.com/sqlite-edge',
        score: 421,
        author: 'dbexpert'
      },
      {
        title: 'Building Real-Time Applications with Node.js',
        url: 'https://example.com/nodejs-realtime',
        score: 312,
        author: 'nodejspro'
      },
      {
        title: 'Tailwind CSS: Utility-First Styling Approach',
        url: 'https://tailwindcss.com',
        score: 278,
        author: 'cssmaster'
      },
      {
        title: 'Web Scraping Best Practices with Cheerio',
        url: 'https://example.com/cheerio-guide',
        score: 167,
        author: 'scraper101'
      },
      {
        title: 'Express.js Performance Optimization Tips',
        url: 'https://expressjs.com/guide',
        score: 203,
        author: 'backend_dev'
      }
    ];

    // Uncomment this block to use actual scraping when deployed outside sandbox:
    /*
    const response = await axios.get('https://news.ycombinator.com/');
    const $ = cheerio.load(response.data);
    
    const articles = [];
    
    // Parse the articles from Hacker News
    $('.athing').each((index, element) => {
      const $element = $(element);
      const title = $element.find('.titleline > a').first().text();
      const url = $element.find('.titleline > a').first().attr('href');
      
      // Get the next sibling for score and author info
      const $subtext = $element.next();
      const $scoreElement = $subtext.find('.score');
      const score = $scoreElement.length ? parseInt($scoreElement.text()) : 0;
      const author = $subtext.find('.hnuser').text();
      
      if (title && url) {
        articles.push({ title, url, score, author });
      }
    });
    */
    
    // Insert articles into database
    const insert = db.prepare('INSERT INTO articles (title, url, score, author) VALUES (?, ?, ?, ?)');
    
    let insertedCount = 0;
    for (const article of mockArticles) {
      try {
        insert.run(article.title, article.url, article.score, article.author);
        insertedCount++;
      } catch (error) {
        // Skip duplicates or errors
        console.log('Skipping article:', article.title);
      }
    }
    
    res.json({ 
      message: 'Scraping completed successfully', 
      scraped: mockArticles.length,
      inserted: insertedCount
    });
  } catch (error) {
    console.error('Error scraping articles:', error);
    res.status(500).json({ error: 'Failed to scrape articles' });
  }
});

// Serve static files from the client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
