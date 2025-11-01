import { verifyToken } from '../utils/jwtUtil.js';

export const requireAdmin = (minLevel = 5) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authorization token'
        });
      }
      
      const user = verifyToken(token);
      
      if (user.access_level < minLevel) {
        return res.status(403).json({
          success: false,
          message: `Access level ${minLevel} required`
        });
      }
      
      req.user = user;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  };
};

export default requireAdmin;
