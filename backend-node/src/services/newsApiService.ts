import axios from 'axios';
import { config } from '../config/env';
import { redisClient } from '../config/redis';

// Define standardized Article interface structure for frontend and gateway typing
export interface NewsArticle {
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
 * Service orchestrating external news API feeds, Redis cache retrieval, and clean mock fallback generations.
 */
export class NewsApiService {

    private static CACHE_EXPIRATION = 600; // Cache articles for 10 minutes (600 seconds)

    /**
     * Retrieves top headlines filtered by category and search queries, leveraging Redis cache or Mock fallbacks
     */
    public static async getTopHeadlines(category: string = 'general', query: string = ''): Promise<NewsArticle[]> {
        const cacheKey = `news:headlines:${category.toLowerCase()}:${query.toLowerCase().trim()}`;

        // 1. Try to read cached articles from Redis
        try {
            if (redisClient.isOpen) {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    console.log(`✓ Cache Hit: Loaded news feeds from Redis memory [Key: ${cacheKey}]`);
                    return JSON.parse(cachedData);
                }
            }
        } catch (error) {
            console.error('✗ Redis cache read error:', error);
        }

        let articles: NewsArticle[] = [];

        // 2. Fetch fresh articles from NewsAPI if Key is present
        if (config.newsApiKey) {
            try {
                console.log(`📡 Fetching live headlines from external NewsAPI... Category: ${category}`);
                const response = await axios.get(`${config.newsApiUrl}/top-headlines`, {
                    params: {
                        category: category === 'general' ? undefined : category,
                        q: query || undefined,
                        apiKey: config.newsApiKey,
                        language: 'en',
                        pageSize: 20
                    }
                });

                if (response.data && response.data.articles) {
                    articles = response.data.articles.map((item: any) => ({
                        title: item.title || 'No Title Available',
                        description: item.description || '',
                        content: item.content || item.description || '',
                        author: item.author || null,
                        source: item.source ? item.source.name : 'Unknown Source',
                        url: item.url,
                        imageUrl: item.urlToImage || null,
                        publishedAt: item.publishedAt || new Date().toISOString(),
                        category: category
                    }));
                }
            } catch (error: any) {
                console.error('✗ NewsAPI request failed. Falling back to secure mock generation. Error:', error.message);
                articles = this.generateMockArticles(category, query);
            }
        } else {
            // No API Key provided - gracefully fall back to local mock data generator
            articles = this.generateMockArticles(category, query);
        }

        // 3. Cache articles in Redis for future requests
        try {
            if (redisClient.isOpen && articles.length > 0) {
                await redisClient.setEx(cacheKey, this.CACHE_EXPIRATION, JSON.stringify(articles));
                console.log(`✓ Cache Miss: Cached ${articles.length} articles in Redis [Key: ${cacheKey}]`);
            }
        } catch (error) {
            console.error('✗ Redis cache write error:', error);
        }

        return articles;
    }

    /**
     * Generates rich, realistic mock articles based on requested categories for frictionless local development
     */
    private static generateMockArticles(category: string, query: string): NewsArticle[] {
        console.log(`⚙️ Generating pristine offline Mock Articles... Category: ${category}`);
        
        const mockTemplates: Record<string, Array<{title: string, desc: string}>> = {
            general: [
                { title: "Global Summit Agrees on New Clean Energy Initiatives", desc: "World leaders gathered to finalize a landmark pact aimed at cutting global carbon emissions by 45% over the next decade." },
                { title: "Metropolis Introduces Zero-Emission Public Transit System", desc: "A major city completes its complete transition of all public buses and subways to pure hydrogen electric power grids." }
            ],
            technology: [
                { title: "Next-Gen Quantum Processors Reach Stable Coherence", desc: "Silicon Valley developers announced stable room-temperature quantum calculations using modular light-based logic gates." },
                { title: "Decoupled Web Frameworks Dominate Modern Portals", desc: "A comprehensive market analysis shows a 300% spike in businesses utilizing isolated API architectures." }
            ],
            business: [
                { title: "Interest Rate Adjustments Lead to Market Stabilizations", desc: "Federal reserves announce adjustments to benchmark indices, prompting positive reactions across international trading floors." },
                { title: "Emerging Tech Hubs Attract Record Venture Capital", desc: "Venture funding flows migrate to green infrastructure startups as conventional markets face saturation." }
            ],
            sports: [
                { title: "Championship Finals End in Dramatic Double-Overtime Victory", desc: "An historic season culminates in an underdog victory decided by a final-second baseline shot." },
                { title: "International Athletics Board Outlines Health Advancements", desc: "New training protocols and AI biomechanics analysis become mandatory across state-sponsored training centers." }
            ]
        };

        const templates = mockTemplates[category.toLowerCase()] || mockTemplates.general;

        const articles = templates.map((tpl, idx) => ({
            title: tpl.title,
            description: tpl.desc,
            content: `${tpl.desc} This represents a complete mock-news paragraph generated gracefully by the Node.js API Gateway to ensure smooth development sessions without relying on third-party keys.`,
            author: "Prakhar Yadav",
            source: "Modern Portal Daily",
            url: `https://example.com/news/${category}/${idx}`,
            imageUrl: null, // Frontend will map a gorgeous default HSL placeholder gradient!
            publishedAt: new Date(Date.now() - idx * 3600000).toISOString(),
            category: category
        }));

        // Filter mock results if a query search term is passed
        if (query) {
            return articles.filter(art => 
                art.title.toLowerCase().includes(query.toLowerCase()) || 
                art.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        return articles;
    }
}
