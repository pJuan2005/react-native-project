const express = require("express");
const dashboard = require("../controllers/dashboard.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("admin"));

router.get("/", dashboard.getAdminDashboard);

module.exports = router;
