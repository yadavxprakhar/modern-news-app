import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config/env';

const router = Router();

/**
 * Custom Gateway Proxy handler that intercepts incoming client requests (auth, preferences, bookmarks)
 * and transparently forwards them to the underlying Spring Boot Microservice.
 */
const proxyToSpring = async (req: Request, res: Response) => {
    // Reconstruct the Spring Boot target URL (e.g. req.originalUrl replaces '/api' prefix with Spring's base path)
    const springTargetUrl = `${config.springServiceUrl}${req.path}`;
    
    console.log(`🔀 Proxying request: [${req.method}] ${req.originalUrl} ➜ ${springTargetUrl}`);

    try {
        // Forward request properties securely
        const response = await axios({
            method: req.method,
            url: springTargetUrl,
            data: req.body,
            headers: {
                // Pass along authentication Bearer tokens transparently
                Authorization: req.headers.authorization || '',
                'Content-Type': 'application/json'
            },
            validateStatus: () => true // Prevent axios from throwing exceptions on HTTP 4xx/5xx responses
        });

        // Pipe responses right back to client
        res.status(response.status).json(response.data);
    } catch (error: any) {
        console.error('✗ Proxy server routing failure:', error.message);
        res.status(502).json({
            status: 'error',
            message: 'Bad Gateway: Microservice communication failure occurred',
            details: error.message
        });
    }
};

// Route and match all Auth, Users, and Bookmarks routes to the Spring Boot proxy handler
router.all(['/auth', '/auth/*'], proxyToSpring);
router.all(['/users', '/users/*'], proxyToSpring);
router.all(['/bookmarks', '/bookmarks/*'], proxyToSpring);

export default router;
