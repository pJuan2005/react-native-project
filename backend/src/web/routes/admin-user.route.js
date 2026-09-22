const express = require("express");
const user = require("../controllers/user.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("admin"));

router.get("/", user.getAdminUsers);
router.get("/:id", user.getAdminUserById);
router.put("/:id", user.updateAdminUser);

module.exports = router;
