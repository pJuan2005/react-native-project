const express = require("express");
const propertyRouter = require("./property.route");
const hostPropertyRouter = require("./host-property.route");
const adminPropertyRouter = require("./admin-property.route");
const adminUserRouter = require("./admin-user.route");
const adminSettingRouter = require("./admin-setting.route");
const bookingRouter = require("./booking.route");
const hostBookingRouter = require("./host-booking.route");
const adminBookingRouter = require("./admin-booking.route");
const reviewRouter = require("./review.route");
const hostDashboardRouter = require("./host-dashboard.route");
const adminDashboardRouter = require("./admin-dashboard.route");
const adminReportRouter = require("./admin-report.route");
const quickManageRouter = require("./quick-manage.route");

const router = express.Router();

router.use("/properties", propertyRouter);
router.use("/bookings", bookingRouter);
router.use("/reviews", reviewRouter);
router.use("/quick-manage", quickManageRouter);
router.use("/host/properties", hostPropertyRouter);
router.use("/host/bookings", hostBookingRouter);
router.use("/host/dashboard", hostDashboardRouter);
router.use("/admin/properties", adminPropertyRouter);
router.use("/admin/users", adminUserRouter);
router.use("/admin/settings", adminSettingRouter);
router.use("/admin/bookings", adminBookingRouter);
router.use("/admin/dashboard", adminDashboardRouter);
router.use("/admin/reports", adminReportRouter);

module.exports = router;

