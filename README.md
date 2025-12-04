# 4news

A news aggregator application built with Express, React, SQLite, and TanStack Query.

## Features

- **Backend**: Express server with SQLite database for storing articles
- **Frontend**: React with Tailwind CSS for a modern UI
- **Data Fetching**: TanStack Query for efficient client-server state management
- **Web Scraping**: Cheerio for parsing article data (currently using mock data)

## Tech Stack

### Backend
- Express.js
- better-sqlite3 (SQLite database)
- Axios (HTTP client)
- Cheerio (Web scraping)
- CORS

### Frontend
- React
- Vite (Build tool)
- TanStack Query (React Query)
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Harsha-Bhattacharyya/4news.git
cd 4news
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

#### Development Mode

1. Start the backend server (Terminal 1):
```bash
npm run dev
```
The server will run on http://localhost:3001

2. Start the frontend dev server (Terminal 2):
```bash
npm run client
```
The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

#### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at http://localhost:3001

## API Endpoints

### GET /api/articles
Fetches all articles from the database.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "url": "https://example.com",
    "score": 123,
    "author": "username",
    "created_at": "2025-12-04 16:06:57"
  }
]
```

### POST /api/scrape
Scrapes news articles and stores them in the database.

**Response:**
```json
{
  "message": "Scraping completed successfully",
  "scraped": 8,
  "inserted": 8
}
```

## Usage

1. When you first open the application, it will display a message to scrape articles if the database is empty
2. Click the "Scrape Hacker News" button to fetch and store articles
3. Articles will be displayed in a card layout with title, score, author, and timestamp
4. Click on any article title to open it in a new tab

## Features

The application now scrapes real articles from Hacker News! When you click the "Scrape Hacker News" button:
- Fetches the current front page of Hacker News
- Extracts article titles, URLs, scores, and authors
- Stores them in the SQLite database
- Prevents duplicates with UNIQUE URL constraint
- Displays up to 30 articles per scrape

## Project Structure

```
4news/
├── server.js           # Express backend server
├── package.json        # Backend dependencies
├── news.db            # SQLite database (auto-generated)
└── client/            # React frontend
    ├── src/
    │   ├── App.jsx    # Main React component
    │   ├── main.jsx   # React entry point
    │   └── index.css  # Tailwind CSS
    ├── vite.config.js # Vite configuration
    └── package.json   # Frontend dependencies
```

## License

ISC

