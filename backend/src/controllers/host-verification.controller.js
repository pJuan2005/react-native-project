const HostVerificationService = require('../services/host-verification.service');
const { success, created, badRequest, error } = require('../utils/response');

const submitVerification = async (req, res) => {
  try {
    const hostId = req.user?.id || req.body.hostId || 2;
    const { idCardNumber, idCardFrontUrl, idCardBackUrl, businessLicenseUrl } = req.body;

    const data = await HostVerificationService.submitVerification(hostId, {
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      businessLicenseUrl,
    });

    return created(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi nộp hồ sơ xác minh');
  }
};

const getMyVerification = async (req, res) => {
  try {
    const hostId = req.query.hostId || req.user?.id || 2;
    const data = await HostVerificationService.getVerificationStatus(hostId);
    return success(res, data, 'Lấy trạng thái xác minh thành công');
  } catch (err) {
    return error(res, 'Lỗi khi lấy trạng thái xác minh');
  }
};

const getAdminHostVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await HostVerificationService.getAllVerifications(status);
    return success(res, data, 'Lấy danh sách hồ sơ xác minh thành công');
  } catch (err) {
    return error(res, 'Lỗi khi tải danh sách xác minh');
  }
};

const reviewHostVerification = async (req, res) => {
  try {
    const { hostId } = req.params;
    const adminId = req.user?.id || 1;
    const { decision, rejectionReason } = req.body;

    const data = await HostVerificationService.reviewVerification(hostId, adminId, {
      decision,
      rejectionReason,
    });

    return success(res, data, data.message);
  } catch (err) {
    return badRequest(res, err.message || 'Lỗi khi duyệt hồ sơ');
  }
};

module.exports = {
  submitVerification,
  getMyVerification,
  getAdminHostVerifications,
  reviewHostVerification,
};
