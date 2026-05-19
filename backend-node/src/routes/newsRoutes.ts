import { Router, Request, Response } from 'express';
import { NewsApiService } from '../services/newsApiService';

const router = Router();

/**
 * GET /api/news
 * Retrieves cached top headlines filtered by category or search terms
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const category = (req.query.category as string) || 'general';
        const query = (req.query.q as string) || '';

        const articles = await NewsApiService.getTopHeadlines(category, query);
        res.json({
            status: 'success',
            results: articles.length,
            articles
        });
    } catch (error: any) {
        console.error('✗ Gateway news route error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve news headlines',
            details: error.message
        });
    }
});

export default router;
