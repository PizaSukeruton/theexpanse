// backend/api/narrative-paths.js

import narrativeAccess from '../utils/narrativeAccess.js';
import { validateHexId, sendJsonResponse  } from '../utils/hexUtils.js';

/**
 * Helper to extract hex ID from URL path.
 * Assumes the path structure is like /basePath/ID or /basePath/%23ID
 * @param {string} path - The full URL pathname.
 * @param {string} base - The base path for the router.
 * @returns {string|null} The extracted hex ID (e.g., '#C10001') or null if not found/invalid.
 */
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

/**
 * Router function for Narrative Paths API endpoints.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {string} basePath - The base path for this router (e.g., '/api/narrative/path').
 */
function router(req, res, basePath) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // POST /api/narrative/path - Create a new narrative path
    if (method === 'POST' && pathname === basePath) {
        try {
            const pathData = req.body; // req.body is already parsed by server.js
            if (!pathData) {
                return sendJsonResponse(res, 400, {
                    code: 'MISSING_BODY',
                    message: 'Request body is missing or empty.'
                }, false);
            }

            narrativeAccess.createNarrativePath(pathData)
                .then(newPath => sendJsonResponse(res, 201, { message: 'Narrative path created successfully.', path: newPath }, true))
                .catch(error => {
                    const statusCode = error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('same-loops') ? 400 :
                                       error.message.includes('not found') ? 404 : 500;
                    console.error(`Error creating narrative path:`, error.message);
                    sendJsonResponse(res, statusCode, {
                        code: statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
                        message: error.message,
                        details: error.message
                    }, false);
                });
        } catch (error) {
            sendJsonResponse(res, 400, {
                code: 'INVALID_JSON',
                message: 'Invalid JSON body.',
                details: error.message
            }, false);
        }
        return;
    }

    // GET /api/narrative/path/:id - Retrieve specific narrative path
    if (method === 'GET' && pathname.startsWith(`${basePath}/`)) {
        const pathId = getIdFromPath(pathname, basePath);
        if (!validateHexId(pathId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid narrative path ID format.'
            }, false);
        }

        narrativeAccess.getNarrativePathById(pathId)
            .then(path => {
                if (!path) {
                    return sendJsonResponse(res, 404, {
                        code: 'NOT_FOUND',
                        message: `Narrative path with ID ${pathId} not found.`
                    }, false);
                }
                sendJsonResponse(res, 200, path, true);
            })
            .catch(error => {
                console.error(`Error retrieving narrative path ${pathId}:`, error.message);
                sendJsonResponse(res, 500, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve narrative path.',
                    details: error.message
                }, false);
            });
        return;
    }

    // GET /api/narrative/path - List all narrative paths
    if (method === 'GET' && pathname === basePath) {
        narrativeAccess.listNarrativePaths()
            .then(paths => sendJsonResponse(res, 200, paths, true))
            .catch(error => {
                console.error('Error listing narrative paths:', error.message);
                sendJsonResponse(res, 500, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve narrative paths.',
                    details: error.message
                }, false);
            });
        return;
    }

    // If no route matches
    sendJsonResponse(res, 404, {
        code: 'NOT_FOUND',
        message: 'Endpoint not found or method not allowed.'
    }, false);
}

export default router;

