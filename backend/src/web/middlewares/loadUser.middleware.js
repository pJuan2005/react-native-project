const User = require("../models/user.model");

async function loadUser(req, _res, next) {
  try {
    let userId = req.session?.user?.id;

    // 1. Support Mobile Authorization header: Bearer token_<userId>_<timestamp>
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const token = req.headers.authorization.replace("Bearer ", "").trim();
      const parts = token.split("_");
      if (parts.length >= 2 && parts[1]) {
        userId = parts[1];
      }
    }

    // 2. Support Mobile query or body userId parameter
    if (!userId && (req.query?.userId || req.body?.userId)) {
      userId = req.query?.userId || req.body?.userId;
    }

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);

    if (!user) {
      if (req.session) {
        req.session.user = null;
      }
      return next();
    }

    // Normalize role: "customer" in database is mapped to "guest" on web
    if (user.role === "customer") {
      user.role = "guest";
    }

    req.currentUser = user;
    req.user = user;
    return next();
  } catch (_error) {
    return next();
  }
}

module.exports = loadUser;

