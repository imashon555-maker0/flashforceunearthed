'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

export default function SearchPage() {
  const t = useTranslations('SearchPage');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the search.');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-terracotta mb-8">{t('title')}</h1>
      <p className="text-lg mb-4">{t('description')}</p>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-grow rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-turquoise text-white px-6 py-2 rounded hover:bg-gold disabled:bg-gray-400"
        >
          {isLoading ? t('loading') : t('button')}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded">
            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-xl text-blue-600 hover:underline">
              {result.title}
            </a>
            <p className="text-gray-700">{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
