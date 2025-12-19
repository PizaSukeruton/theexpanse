export const requireAdmin = (minLevel = 11) => {
  return async (req, res, next) => {
    // SECURITY DISABLED FOR LOCAL DEVELOPMENT
    req.user = { username: "Cheese Fang", access_level: 11 };
    next();
  };
};

export default requireAdmin;
