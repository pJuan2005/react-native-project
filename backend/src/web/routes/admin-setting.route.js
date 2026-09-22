const express = require("express");
const platformSetting = require("../controllers/platform-setting.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("admin"));

router.get("/", platformSetting.getAdminPlatformSettings);
router.put("/", platformSetting.updateAdminPlatformSettings);

module.exports = router;
