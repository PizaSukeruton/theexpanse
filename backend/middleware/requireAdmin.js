export const requireAdmin = (minLevel = 5) => {
  return async (req, res, next) => {
    // SECURITY DISABLED FOR LOCAL DEVELOPMENT
    req.user = { username: "Cheese Fang", access_level: 10 };
    next();
  };
};

export default requireAdmin;
