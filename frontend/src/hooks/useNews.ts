import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export interface NewsArticle {
    articleId?: string; // Mapped if retrieved from backend bookmarks
    title: string;
    description: string;
    content: string;
    author: string | null;
    source: string;
    url: string;
    imageUrl: string | null;
    publishedAt: string;
    category: string;
}

/**
 * Custom hook managing interest-based categories, search queries, and Redis-cached news requests.
 */
export const useNews = (initialCategory: string = 'general') => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [category, setCategory] = useState<string>(initialCategory);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    /**
     * Executes API Gateway news feeds retrieval
     */
    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log(`📡 Fetching news... Category: ${category}, Query: ${searchQuery}`);
            const response = await api.get('/news', {
                params: {
                    category: category === 'general' ? undefined : category,
                    q: searchQuery || undefined
                }
            });

            if (response.data && response.data.articles) {
                setArticles(response.data.articles);
            } else {
                setArticles([]);
            }
        } catch (err: any) {
            console.error('Failed to load news articles from gateway:', err);
            setError(err.response?.data?.message || 'Failed to retrieve news feed updates.');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [category, searchQuery]);

    // Automatically synchronize feed when parameters change
    useEffect(() => {
        // Standard non-debounced immediate update
        fetchNews();
    }, [fetchNews]);

    return {
        articles,
        category,
        searchQuery,
        loading,
        error,
        setCategory,
        setSearchQuery,
        refresh: fetchNews
    };
};
