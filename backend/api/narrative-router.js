// backend/api/narrative-router.js
import express from 'express';
import narrativePathsRouter from './narrative-paths.js';
import narrativeProgressionRouter from './narrative-progression.js';
import narrativeSegmentsRouter from './narrative-segments.js';
import narrativeStorytellerRouter from './narrative-storyteller.js';
const router = express.Router();

// Adapter to convert custom routers to Express middleware
function adaptCustomRouter(customRouter, basePath) {
    return (req, res, next) => {
        // The custom routers expect req.url to be the full path
        const originalUrl = req.originalUrl || req.url;
        req.url = originalUrl;
        
        // Call the custom router
        customRouter(req, res, basePath);
    };
}

// Mount narrative sub-routers
router.use('/path', adaptCustomRouter(narrativePathsRouter, '/api/narrative/path'));
router.use('/segment', adaptCustomRouter(narrativeSegmentsRouter, '/api/narrative/segment'));
router.use('/storyteller', adaptCustomRouter(narrativeStorytellerRouter, '/api/narrative/storyteller'));
router.use('/', adaptCustomRouter(narrativeProgressionRouter, '/api/narrative'));
export default router;
