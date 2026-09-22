const User = require("../models/user.model");

async function loadUser(req, _res, next) {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);

    if (!user) {
      req.session.user = null;
      return next();
    }

    req.currentUser = user;
    return next();
  } catch (_error) {
    return next();
  }
}

module.exports = loadUser;
