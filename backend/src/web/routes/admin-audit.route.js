const express = require("express");
const { requireRoles } = require("../middlewares/auth.middleware");
const AuditService = require("../../services/audit.service");

const router = express.Router();
router.use(requireRoles("admin"));

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100, 10);
    const offset = parseInt(req.query.offset || 0, 10);
    const logs = await AuditService.getRecentLogs(limit, offset);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: "Không thể tải nhật ký kiểm toán" });
  }
});

module.exports = router;
