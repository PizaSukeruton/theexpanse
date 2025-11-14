import { verifyToken } from '../utils/jwtUtil.js';

export const requireAdmin = (minLevel = 11) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false,
          message: 'No authentication token provided' 
        });
      }

      const token = authHeader.slice(7); // Remove 'Bearer ' prefix
      
      // Verify token
      const decoded = verifyToken(token);
      
      // Check access level
      if (!decoded.access_level || decoded.access_level < minLevel) {
        return res.status(403).json({ 
          success: false,
          message: `Access denied. Level ${minLevel} required, you have level ${decoded.access_level || 0}` 
        });
      }
      
      // Attach user info to request
      req.user = decoded;
      next();
      
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  };
};

export default requireAdmin;
