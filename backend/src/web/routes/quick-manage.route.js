const express = require("express");
const quickManage = require("../controllers/quick-manage.controller");

const router = express.Router();

router.get("/:token", quickManage.getQuickManageProperty);
router.post("/:token/direct-bookings", quickManage.createDirectBooking);

module.exports = router;
