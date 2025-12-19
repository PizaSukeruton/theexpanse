import { verifyToken as verifyTokenUtil } from '../utils/jwtUtil.js';

/**
 * Hybrid Admin Authentication Middleware
 * Accepts:
 * 1. CMS Session (req.session) with accessLevel >= 11
 * 2. JWT Bearer token in Authorization header
 *
 * This patch fixes the Entity Manager (401 errors)
 * while keeping full JWT support for external API tools.
 */

export const verifyAdminAuth = (req, res, next) => {
    try {
        //
        // 1. SESSION-BASED AUTH (CMS UI)
        //
        if (
            req.session &&
            req.session.userId &&
            req.session.accessLevel >= 11
        ) {
            req.user = {
                user_id: req.session.userId,
                username: req.session.username,
                access_level: req.session.accessLevel,
                auth_type: 'session'
            };
            return next();
        }

        //
        // 2. JWT HEADER AUTH (external tools, curl, Postman)
        //
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Access denied. No session or token provided.'
            });
        }

        // Bearer abc123...
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        const decoded = verifyTokenUtil(token);

        // Require admin-level access
        if (!decoded.access_level || decoded.access_level < 11) {
            return res.status(403).json({
                error: 'Admin access required.'
            });
        }

        req.user = decoded;
        return next();

    } catch (error) {
        console.error('Hybrid auth error:', error);
        return res.status(401).json({
            error: 'Invalid or expired token.'
        });
    }
};

// Keep the original verifyToken for backward compatibility
export const verifyToken = verifyAdminAuth;

export default verifyAdminAuth;
