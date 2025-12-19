import { validateHexId, sendJsonResponse } from '../utils/hexUtils.js';
import narrativeEngine from '../utils/narrativeEngine.js';

const getIdFromPath = (path, base) => {
    if (!path.startsWith(`${base}/`)) {
        return null;
    }
    const remainingPath = path.substring(base.length + 1);
    const parts = remainingPath.split('/').filter(Boolean);

    if (parts.length === 0) {
        return null;
    }

    let id = parts[0];
    if (id.startsWith('%23')) {
        id = '#' + id.substring(3);
    } else if (!id.startsWith('#')) {
        id = `#${id}`;
    }
    return id;
};

function router(req, res, basePath) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    if (method === 'GET' && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
        const characterId = getIdFromPath(pathname, basePath);
        if (!validateHexId(characterId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid character ID format.'
            }, false);
        }

        narrativeEngine.getStorytellerStep(characterId)
            .then(storyContext => {
                sendJsonResponse(res, 200, storyContext, true);
            })
            .catch(error => {
                const statusCode = error.message.includes('not found') ? 404 :
                                  error.message.includes('Invalid') ? 400 : 500;
                console.error(`Error getting storyteller step for ${characterId}:`, error.message);
                sendJsonResponse(res, statusCode, {
                    code: statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                    details: error.message
                }, false);
            });
        return;
    }

    sendJsonResponse(res, 404, {
        code: 'NOT_FOUND',
        message: 'Endpoint not found or method not allowed.'
    }, false);
}

export default router;
