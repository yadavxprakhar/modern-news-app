import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { connectRedis } from './config/redis';
import { apiRateLimiter } from './middleware/rateLimiter';
import newsRouter from './routes/newsRoutes';
import gatewayProxyRouter from './routes/gatewayProxyRoutes';

const app = express();

// 1. Apply global production security middleware (Helmet shields)
app.use(helmet());

// 2. Configure Cross-Origin Resource Sharing (CORS) rules for React Client connectivity
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Enable raw JSON parsing on request payloads
app.use(express.json());

// 4. Apply Redis-backed request Rate Limiting to all API routes
app.use('/api', apiRateLimiter);

// 5. Mount API Gateway routing paths
app.use('/api/news', newsRouter);
app.use('/api', gatewayProxyRouter); // Proxies auth, users, and bookmarks requests

// 6. Basic Gateway service health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'API Gateway'
    });
});

/**
 * Initializes Redis caches and opens server listeners on custom network ports
 */
const startServer = async () => {
    // 1. Establish background Redis connections
    await connectRedis();

    // 2. Listen on network port
    app.listen(config.port, () => {
        console.log(`=======================================================`);
        console.log(`🚀 Decoupled API Gateway Express server is active`);
        console.log(`📡 Network Listener Port: http://localhost:${config.port}`);
        console.log(`⚙️  Node Environment Type: ${config.nodeEnv}`);
        console.log(`=======================================================`);
    });
};

// Fire up the Gateway server
startServer();
