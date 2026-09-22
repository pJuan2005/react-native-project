function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({
      message: "Authentication is required",
    });
  }

  return next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};
