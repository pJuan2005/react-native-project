const express = require("express");
const review = require("../controllers/review.controller");
const { requireRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireRoles("guest"));
router.post("/", review.createReview);

module.exports = router;
