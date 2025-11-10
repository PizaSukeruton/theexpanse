import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens for protected routes
 * Created: November 6, 2025
 * Security Fix #7
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token from Authorization header
 */
export const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        // Check for Bearer token
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. Invalid token format.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please login again.' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token.' 
            });
        }
        return res.status(500).json({ 
            error: 'Token verification failed.' 
        });
    }
};

/**
 * Optional: Verify admin role
 */
export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Access denied. Admin privileges required.' 
        });
    }
};

export default verifyToken;
