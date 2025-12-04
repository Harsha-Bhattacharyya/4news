import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = '/api'

function App() {
  const queryClient = useQueryClient()

  // Fetch articles using useQuery
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/articles`)
      return response.data
    }
  })

  // Scrape mutation using useMutation
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_URL}/scrape`)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch articles on successful scrape
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">4News - News Aggregator</h1>
          <button
            onClick={() => scrapeMutation.mutate()}
            disabled={scrapeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            {scrapeMutation.isPending ? 'Scraping...' : 'Scrape Hacker News'}
          </button>
          {scrapeMutation.isSuccess && (
            <p className="mt-2 text-green-600 font-medium">
              Successfully scraped {scrapeMutation.data.scraped} articles, inserted {scrapeMutation.data.inserted} new articles!
            </p>
          )}
          {scrapeMutation.isError && (
            <p className="mt-2 text-red-600 font-medium">
              Error: {scrapeMutation.error.message}
            </p>
          )}
        </header>

        <main>
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl text-gray-600">Loading articles...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {error.message}
            </div>
          )}

          {articles && articles.length === 0 && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              No articles yet. Click "Scrape Hacker News" to fetch some articles!
            </div>
          )}

          {articles && articles.length > 0 && (
            <div className="space-y-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {article.title}
                    </a>
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {article.score > 0 && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        {article.score} points
                      </span>
                    )}
                    {article.author && (
                      <span>by {article.author}</span>
                    )}
                    {article.created_at && (
                      <span>{new Date(article.created_at).toLocaleString()}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
