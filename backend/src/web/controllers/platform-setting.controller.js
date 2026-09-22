const PlatformSetting = require("../models/platform-setting.model");
const {
  normalizeCommissionRate,
  normalizeUsdToVndRate,
} = require("../common/bookingFinance");

function mapSettingsResponse(settings) {
  const onlineCommissionRate = normalizeCommissionRate(
    settings.onlineCommissionRate ?? settings.platformCommissionRate,
  );
  const directCommissionRate = normalizeCommissionRate(
    settings.directCommissionRate,
    0.05,
  );

  return {
    usdToVndRate: normalizeUsdToVndRate(settings.usdToVndRate),
    onlineCommissionRate,
    directCommissionRate,
    platformCommissionRate: onlineCommissionRate,
    onlineCommissionPercent: Number((onlineCommissionRate * 100).toFixed(2)),
    directCommissionPercent: Number((directCommissionRate * 100).toFixed(2)),
    platformCommissionPercent: Number((onlineCommissionRate * 100).toFixed(2)),
    paymentBankCode: String(settings.paymentBankCode || ""),
    paymentBankName: String(settings.paymentBankName || ""),
    paymentAccountNumber: String(settings.paymentAccountNumber || ""),
    paymentAccountName: String(settings.paymentAccountName || ""),
  };
}

exports.getAdminPlatformSettings = async (_req, res) => {
  try {
    const settings = await PlatformSetting.getPlatformSettings();

    return res.json({
      settings: mapSettingsResponse(settings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load platform settings right now.",
    });
  }
};

exports.updateAdminPlatformSettings = async (req, res) => {
  const usdToVndRate = Number(req.body.usdToVndRate);
  const onlineCommissionPercent = Number(
    req.body.onlineCommissionPercent ?? req.body.platformCommissionPercent,
  );
  const directCommissionPercent = Number(req.body.directCommissionPercent);
  const paymentBankCode = String(req.body.paymentBankCode || "").trim();
  const paymentBankName = String(req.body.paymentBankName || "").trim();
  const paymentAccountNumber = String(req.body.paymentAccountNumber || "").trim();
  const paymentAccountName = String(req.body.paymentAccountName || "").trim();

  if (!Number.isFinite(usdToVndRate) || usdToVndRate <= 0) {
    return res.status(400).json({
      message: "Please provide a valid USD to VND exchange rate.",
    });
  }

  if (
    !Number.isFinite(onlineCommissionPercent) ||
    onlineCommissionPercent < 0 ||
    onlineCommissionPercent >= 100
  ) {
    return res.status(400).json({
      message: "Online commission must be between 0 and 99.99 percent.",
    });
  }

  if (
    !Number.isFinite(directCommissionPercent) ||
    directCommissionPercent < 0 ||
    directCommissionPercent >= 100
  ) {
    return res.status(400).json({
      message: "Direct booking commission must be between 0 and 99.99 percent.",
    });
  }

  if (!paymentBankCode) {
    return res.status(400).json({
      message: "Please provide the payment bank code for VietQR generation.",
    });
  }

  if (!paymentBankName) {
    return res.status(400).json({
      message: "Please provide the payment bank name.",
    });
  }

  if (!paymentAccountNumber) {
    return res.status(400).json({
      message: "Please provide the payment account number.",
    });
  }

  if (!paymentAccountName) {
    return res.status(400).json({
      message: "Please provide the payment account name.",
    });
  }

  try {
    const settings = await PlatformSetting.updatePlatformSettings({
      usdToVndRate,
      onlineCommissionRate: onlineCommissionPercent / 100,
      directCommissionRate: directCommissionPercent / 100,
      paymentBankCode,
      paymentBankName,
      paymentAccountNumber,
      paymentAccountName,
    });

    return res.json({
      message: "Platform settings updated successfully.",
      settings: mapSettingsResponse(settings),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to update platform settings right now.",
    });
  }
};
