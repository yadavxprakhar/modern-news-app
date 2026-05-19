import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { MOCK_ARTICLES, simulateNetworkDelay } from '../api/mockData';

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
     * Executes API Gateway news feeds retrieval with developer sandboxing support
     */
    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Simulate active network latency (3G profile) if selected
            if (localStorage.getItem('dev-mode-delay') === 'true') {
                console.log('⏳ DEV SIMULATION: Adding 1.5s simulated network delay...');
                await simulateNetworkDelay(1500);
            }

            // 2. Simulate server exceptions (HTTP 500) if selected
            if (localStorage.getItem('dev-mode-error') === 'true') {
                throw new Error('Simulated Microservice Server Exception (HTTP 500)');
            }

            // 3. Serve local offline mock datasets directly if selected
            if (localStorage.getItem('dev-mode-offline') === 'true') {
                console.log('⚙️ DEV SIMULATION: Serving local offline mock datasets...');
                const filtered = MOCK_ARTICLES.filter((art) => {
                    const matchesCategory = art.category.toLowerCase() === category.toLowerCase();
                    const matchesSearch = searchQuery 
                        ? art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.description.toLowerCase().includes(searchQuery.toLowerCase())
                        : true;
                    return matchesCategory && matchesSearch;
                });
                setArticles(filtered);
                return;
            }

            // 4. Default production REST network fetch
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
            setError(err.message || err.response?.data?.message || 'Failed to retrieve news feed updates.');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [category, searchQuery]);

    // 1. Automatically synchronize feed when parameters change
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // 2. Listen to developer sandbox switch updates to re-trigger diagnostic loads
    useEffect(() => {
        const handleDevChange = () => {
            fetchNews();
        };
        window.addEventListener('dev-mode-change', handleDevChange);
        return () => window.removeEventListener('dev-mode-change', handleDevChange);
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

