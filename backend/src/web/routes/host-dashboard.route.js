const express = require("express");
const dashboard = require("../controllers/dashboard.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("host"));

router.get("/", dashboard.getHostDashboard);

module.exports = router;
