// backend/api/narrative-progression.js

import narrativeEngine from '../utils/narrativeEngine.js';
import { validateHexId, sendJsonResponse  } from '../utils/hexUtils';

/**
 * Helper to extract hex ID from URL path.
 * Assumes the path structure is like /basePath/ID or /basePath/%23ID
 * @param {string} path - The full URL pathname.
 * @param {string} base - The base path for the router.
 * @returns {string|null} The extracted hex ID (e.g., '#700002') or null if not found/invalid.
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
 * Router function for Narrative Progression API endpoints.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {string} basePath - The base path for this router (e.g., '/api/narrative').
 */
function router(req, res, basePath) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // GET /api/narrative/start/:characterId - Initialize or get current narrative state for a character
    if (method === 'GET' && pathname.startsWith(`${basePath}/start/`)) {
        const characterId = getIdFromPath(pathname, `${basePath}/start`);
        if (!validateHexId(characterId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid character ID format.'
            }, false);
        }

        narrativeEngine.initializeCharacterNarrative(characterId)
            .then(narrativeState => sendJsonResponse(res, 200, { message: 'Character narrative initialized/retrieved.', state: narrativeState }, true))
            .catch(error => {
                const statusCode = error.message.includes('not found') ? 404 : 500;
                console.error(`Error initializing/getting narrative for ${characterId}:`, error.message);
                sendJsonResponse(res, statusCode, {
                    code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                    details: error.message
                }, false);
            });
        return;
    }

    // GET /api/narrative/next/:characterId - Get the next narrative segment and choices
    if (method === 'GET' && pathname.startsWith(`${basePath}/next/`)) {
        const characterId = getIdFromPath(pathname, `${basePath}/next`);
        if (!validateHexId(characterId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid character ID format.'
            }, false);
        }

        narrativeEngine.getNextNarrativeStep(characterId)
            .then(result => {
                if (result.message === "End of narrative path.") {
                    return sendJsonResponse(res, 200, { message: result.message, segment: result.segment, choices: [] }, true);
                }
                sendJsonResponse(res, 200, { segment: result.segment, choices: result.choices }, true);
            })
            .catch(error => {
                const statusCode = error.message.includes('not found') || error.message.includes('stalled') ? 404 : 500;
                console.error(`Error getting next narrative step for ${characterId}:`, error.message);
                sendJsonResponse(res, statusCode, {
                    code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                    details: error.message
                }, false);
            });
        return;
    }

    // POST /api/narrative/choose/:characterId - Process a user's choice
    if (method === 'POST' && pathname.startsWith(`${basePath}/choose/`)) {
        const characterId = getIdFromPath(pathname, `${basePath}/choose`);
        if (!validateHexId(characterId)) {
            return sendJsonResponse(res, 400, {
                code: 'INVALID_ID_FORMAT',
                message: 'Invalid character ID format.'
            }, false);
        }

        try {
            const { choice_path_id } = req.body; // Expects { "choice_path_id": "#C10001" }
            if (!choice_path_id || !validateHexId(choice_path_id)) {
                return sendJsonResponse(res, 400, {
                    code: 'INVALID_CHOICE_PATH_ID',
                    message: 'Choice path ID is required and must be a valid hex format.'
                }, false);
            }

            narrativeEngine.processUserChoice(characterId, choice_path_id)
                .then(updatedNarrativeState => sendJsonResponse(res, 200, { message: 'Choice processed successfully.', state: updatedNarrativeState }, true))
                .catch(error => {
                    const statusCode = error.message.includes('not found') || error.message.includes('Invalid path ID') ? 404 : 500;
                    console.error(`Error processing user choice for ${characterId}:`, error.message);
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

    // GET /api/narrative/lore/:query - Query narrative lore (for Claude's Q&A)
    if (method === 'GET' && pathname.startsWith(`${basePath}/lore/`)) {
        const query = pathname.substring(`${basePath}/lore/`.length); // Get query from path segment
        if (!query || query.trim() === '') {
            return sendJsonResponse(res, 400, {
                code: 'MISSING_QUERY',
                message: 'Lore query is required.'
            }, false);
        }
        // Decode the query if it contains URL-encoded characters
        const decodedQuery = decodeURIComponent(query.replace(/\+/g, ' ')); // Handle spaces encoded as +

        narrativeEngine.queryNarrativeLore(decodedQuery)
            .then(results => sendJsonResponse(res, 200, results, true))
            .catch(error => {
                console.error(`Error querying narrative lore for "${decodedQuery}":`, error.message);
                sendJsonResponse(res, 500, {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to query narrative lore.',
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

