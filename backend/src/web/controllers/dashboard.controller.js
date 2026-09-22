const Dashboard = require("../models/dashboard.model");

exports.getHostDashboard = async (req, res) => {
  try {
    const data = await Dashboard.getHostDashboard(req.currentUser.id);
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the host dashboard right now.",
    });
  }
};

exports.getAdminDashboard = async (_req, res) => {
  try {
    const data = await Dashboard.getAdminDashboard();
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the admin dashboard right now.",
    });
  }
};

exports.getAdminReports = async (_req, res) => {
  try {
    const data = await Dashboard.getAdminReports();
    return res.json(data);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the reports right now.",
    });
  }
};
