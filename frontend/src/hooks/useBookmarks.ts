import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { NewsArticle } from './useNews';

export interface BookmarkData {
    bookmarkId: string;
    createdAt: string;
    article: NewsArticle;
}

/**
 * Custom hook managing active bookmark syncing, additions, and deletions with PostgreSQL via Node API Gateway proxy.
 */
export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    /**
     * Fetches all saved bookmarks for the authenticated user session
     */
    const fetchBookmarks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/bookmarks');
            setBookmarks(response.data);
        } catch (err: any) {
            console.error('Failed to retrieve bookmark list:', err);
            setError(err.response?.data?.message || 'Failed to sync saved articles.');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Adds an article persistently to the user's bookmarks list
     */
    const addBookmark = async (article: NewsArticle) => {
        setError('');
        try {
            console.log('📌 Persisting bookmark to database:', article.title);
            
            // Sanitize article date for Spring Boot LocalDateTime parsing compatibility
            const sanitizedArticle = { ...article };
            if (sanitizedArticle.publishedAt && sanitizedArticle.publishedAt.endsWith('Z')) {
                sanitizedArticle.publishedAt = sanitizedArticle.publishedAt.slice(0, -1);
            }

            const response = await api.post('/bookmarks', sanitizedArticle);
            const newBookmark: BookmarkData = response.data;
            setBookmarks((prev) => [...prev, newBookmark]);
        } catch (err: any) {
            console.error('Failed to save bookmark:', err);
            setError(err.response?.data?.message || 'Failed to bookmark article.');
            throw err;
        }
    };

    /**
     * Removes an article persistently from the user's bookmarks list by its cached DB Article UUID
     */
    const removeBookmark = async (articleId: string) => {
        setError('');
        try {
            console.log('🗑️ Deleting bookmark from database. Article UUID:', articleId);
            await api.delete(`/bookmarks/${articleId}`);
            // Instantly filter local state for ultra-fast, snappy UI feedback!
            setBookmarks((prev) => prev.filter((b) => b.article.articleId !== articleId));
        } catch (err: any) {
            console.error('Failed to remove bookmark:', err);
            setError(err.response?.data?.message || 'Failed to delete bookmark.');
            throw err;
        }
    };

    /**
     * Helper checks if a given news article URL is already bookmarked by the user
     */
    const isBookmarked = (url: string): boolean => {
        return bookmarks.some((b) => b.article.url === url);
    };

    /**
     * Helper to retrieve the article's UUID if bookmarked
     */
    const getBookmarkedId = (url: string): string | undefined => {
        return bookmarks.find((b) => b.article.url === url)?.article.articleId;
    };

    // Load active bookmarks list automatically on hook execution
    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    return {
        bookmarks,
        loading,
        error,
        addBookmark,
        removeBookmark,
        isBookmarked,
        getBookmarkedId,
        refresh: fetchBookmarks
    };
};
