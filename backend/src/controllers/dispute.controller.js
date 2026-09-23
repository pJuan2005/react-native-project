const DisputeService = require('../services/dispute.service');
const { success, created, badRequest, error } = require('../utils/response');

const createDispute = async (req, res) => {
  try {
    const reporterId = req.user?.id || req.body.reporterId || 1;
    const reporterRole = req.user?.role || 'guest';
    const { targetType, targetId, bookingId, reason, description, evidenceUrl } = req.body;

    const data = await DisputeService.createDispute({
      reporterId,
      reporterRole,
      targetType,
      targetId,
      bookingId,
      reason,
      description,
      evidenceUrl,
    });

    return created(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi gửi khiếu nại');
  }
};

const getDisputes = async (req, res) => {
  try {
    const { status, targetType, limit, offset } = req.query;
    const reporterId = req.user?.role === 'admin' ? null : req.user?.id;

    const data = await DisputeService.getDisputes({
      status,
      targetType,
      reporterId,
      limit,
      offset,
    });

    return success(res, data, 'Lấy danh sách khiếu nại thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy danh sách khiếu nại');
  }
};

const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 1;
    const { status, adminNote, resolutionAction } = req.body;

    const data = await DisputeService.resolveDispute(id, {
      adminId,
      status,
      adminNote,
      resolutionAction,
    });

    return success(res, data, 'Đã giải quyết khiếu nại thành công');
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi giải quyết khiếu nại');
  }
};

module.exports = {
  createDispute,
  getDisputes,
  resolveDispute,
};
