var express = require("express");
var router = express.Router();
var auth = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", auth.handleRegister);
router.post("/login", auth.handleLogin);
router.get("/me", auth.handleMe);
router.post("/logout", auth.handleLogout);
router.put("/profile", requireAuth, auth.handleUpdateProfile);
router.put("/change-password", requireAuth, auth.handleChangePassword);

module.exports = router;
