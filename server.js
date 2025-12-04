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
    // Scrape Hacker News
    const response = await axios.get('https://news.ycombinator.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const articles = [];
    
    // Parse the articles from Hacker News
    $('.athing').each((index, element) => {
      const $element = $(element);
      const title = $element.find('.titleline > a').first().text();
      let url = $element.find('.titleline > a').first().attr('href');
      
      // Handle relative URLs on Hacker News
      if (url && !url.startsWith('http')) {
        url = 'https://news.ycombinator.com/' + url;
      }
      
      // Get the next sibling for score and author info
      const $subtext = $element.next();
      const $scoreElement = $subtext.find('.score');
      const scoreText = $scoreElement.text();
      const score = scoreText ? (parseInt(scoreText.match(/\d+/)?.[0]) || 0) : 0;
      const author = $subtext.find('.hnuser').text() || 'unknown';
      
      if (title && url) {
        articles.push({ title, url, score, author });
      }
    });
    
    // Insert articles into database
    const insert = db.prepare('INSERT INTO articles (title, url, score, author) VALUES (?, ?, ?, ?)');
    
    let insertedCount = 0;
    for (const article of articles) {
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
      scraped: articles.length,
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
