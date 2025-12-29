// backend/utils/hexUtils.js
/**
 * Validates if a string is a valid hex ID format (#XXXXXX).
 * @param {string} hexId - The ID string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateHexId(hexId) {
    return typeof hexId === 'string' && /^#[0-9A-F]{6}$/i.test(hexId);
}
/**
 * Sends a standardized JSON response.
 * @param {object} res - The HTTP response object.
 * @param {number} statusCode - The HTTP status code to send.
 * @param {object} data - The data payload for success responses, or error details for error responses.
 * @param {boolean} isSuccess - True for success response, false for error response.
 * @param {string} [requestId] - Optional request ID for metadata.
 */
function sendJsonResponse(res, statusCode, data, isSuccess, requestId = 'N/A') {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    const response = {
        success: isSuccess,
        metadata: {
            timestamp: new Date().toISOString(),
            request_id: requestId
        }
    };
    if (isSuccess) {
        response.data = data;
    } else {
        response.error = data; // data here is the error object { code, message, details }
    }
    res.end(JSON.stringify(response));
}
// NOTE: The brief mentioned `generateHexId(prefix, category)` from hexUtils.
// However, the AOK ranges are fixed and specific.
// The `generateAokHexId` (from hexIdGenerator.js) is designed for those specific ranges.
// If a generic `generateHexId` is truly needed for other parts of the system,
// it would be implemented here. For the AOK system, `generateAokHexId` is more appropriate.
// For now, I will not implement a generic `generateHexId` here to avoid confusion
// and stick to the specific AOK ID generation logic.
export {
    validateHexId,
    sendJsonResponse,
};
