// backend/api/narrative-segments.js

import narrativeAccess from '../utils/narrativeAccess.js';
import { validateHexId, sendJsonResponse  } from '../utils/hexUtils';

/**
 * Helper to extract hex ID from URL path.
 * Assumes the path structure is like /basePath/ID or /basePath/%23ID
 * @param {string} path - The full URL pathname.
 * @param {string} base - The base path for the router.
 * @returns {string|null} The extracted hex ID (e.g., '#C00001') or null if not found/invalid.
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
 * Router function for Narrative Segments API endpoints.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {string} basePath - The base path for this router (e.g., '/api/narrative/segment').
 */
function router(req, res, basePath) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // POST /api/narrative/segment - Create a new narrative segment
    if (method === 'POST' && pathname === basePath) {
        try {
            const segmentData = req.body; // req.body is already parsed by server.js
            if (!segmentData) {
                return sendJsonResponse(res, 400, {
                    code: 'MISSING_BODY',
                    message: 'Request body is missing or empty.'
                }, false);
            }

            narrativeAccess.createNarrativeSegment(segmentData)
                .then(newSegment => sendJsonResponse(res, 201, { message: 'Narrative segment created successfully.', segment: newSegment }, true))
                .catch(error => {
                    const statusCode = error.message.includes('required') || error.message.includes('Invalid') ? 400 :
                                       error.message.includes('not found') ? 404 : 500;
                    console.error(`Error creating narrative segment:`, error.message);
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

    // GET /api/narrative/segment/:id - Retrieve specific narrative segment
    if (method === 'GET' && pathname.startsWith(`${basePath}/`)) {
        const segmentId = getIdFromPath(pathname, basePath);
        if (!validateHexId(segmentId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid narrative segment ID format.'
            }, false);
        }

        narrativeAccess.getNarrativeSegmentById(segmentId)
            .then(segment => {
                if (!segment) {
                    return sendJsonResponse(res, 404, {
                        code: 'NOT_FOUND',
                        message: `Narrative segment with ID ${segmentId} not found.`
                    }, false);
                }
                sendJsonResponse(res, 200, segment, true);
            })
            .catch(error => {
                console.error(`Error retrieving narrative segment ${segmentId}:`, error.message);
                sendJsonResponse(res, 500, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve narrative segment.',
                    details: error.message
                }, false);
            });
        return;
    }

    // GET /api/narrative/segment - List all narrative segments
    if (method === 'GET' && pathname === basePath) {
        narrativeAccess.listNarrativeSegments()
            .then(segments => sendJsonResponse(res, 200, segments, true))
            .catch(error => {
                console.error('Error listing narrative segments:', error.message);
                sendJsonResponse(res, 500, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve narrative segments.',
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

