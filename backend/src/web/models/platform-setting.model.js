const db = require("../common/db");
const {
  getDefaultDirectCommissionRate,
  getDefaultOnlineCommissionRate,
  getDefaultUsdToVndRate,
  normalizeCommissionRate,
  normalizeUsdToVndRate,
} = require("../common/bookingFinance");

function normalizeTextSetting(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeBankCode(value, fallback) {
  return normalizeTextSetting(value, fallback).replace(/\s+/g, "").toUpperCase();
}

function normalizeAccountNumber(value, fallback) {
  return normalizeTextSetting(value, fallback).replace(/\s+/g, "");
}

const DEFAULT_PLATFORM_SETTINGS = {
  usdToVndRate: getDefaultUsdToVndRate(),
  onlineCommissionRate: getDefaultOnlineCommissionRate(),
  directCommissionRate: getDefaultDirectCommissionRate(),
  paymentBankCode: normalizeBankCode(process.env.PAYMENT_BANK_CODE || "TCB", "TCB"),
  paymentBankName: normalizeTextSetting(
    process.env.PAYMENT_BANK_NAME || "Techcombank",
    "Techcombank",
  ),
  paymentAccountNumber: normalizeAccountNumber(
    process.env.PAYMENT_ACCOUNT_NUMBER || "19071766471019",
    "19071766471019",
  ),
  paymentAccountName: normalizeTextSetting(
    process.env.PAYMENT_ACCOUNT_NAME || "PHAM XUAN CHUAN",
    "PHAM XUAN CHUAN",
  ),
};

const SETTING_KEYS = {
  usdToVndRate: "usd_to_vnd_rate",
  onlineCommissionRate: "online_commission_rate",
  directCommissionRate: "direct_commission_rate",
  legacyPlatformCommissionRate: "platform_commission_rate",
  paymentBankCode: "payment_bank_code",
  paymentBankName: "payment_bank_name",
  paymentAccountNumber: "payment_account_number",
  paymentAccountName: "payment_account_name",
};

const PLATFORM_SETTING_KEYS = Object.values(SETTING_KEYS);

const PlatformSetting = {};

function buildSettingsResponse(rows = []) {
  const settings = {
    ...DEFAULT_PLATFORM_SETTINGS,
    platformCommissionRate: DEFAULT_PLATFORM_SETTINGS.onlineCommissionRate,
  };

  for (const row of rows) {
    if (row.setting_key === SETTING_KEYS.usdToVndRate) {
      settings.usdToVndRate = normalizeUsdToVndRate(row.setting_value);
    }

    if (
      row.setting_key === SETTING_KEYS.onlineCommissionRate ||
      row.setting_key === SETTING_KEYS.legacyPlatformCommissionRate
    ) {
      settings.onlineCommissionRate = normalizeCommissionRate(
        row.setting_value,
      );
    }

    if (row.setting_key === SETTING_KEYS.directCommissionRate) {
      settings.directCommissionRate = normalizeCommissionRate(
        row.setting_value,
        getDefaultDirectCommissionRate(),
      );
    }

    if (row.setting_key === SETTING_KEYS.paymentBankCode) {
      settings.paymentBankCode = normalizeBankCode(
        row.setting_value,
        DEFAULT_PLATFORM_SETTINGS.paymentBankCode,
      );
    }

    if (row.setting_key === SETTING_KEYS.paymentBankName) {
      settings.paymentBankName = normalizeTextSetting(
        row.setting_value,
        DEFAULT_PLATFORM_SETTINGS.paymentBankName,
      );
    }

    if (row.setting_key === SETTING_KEYS.paymentAccountNumber) {
      settings.paymentAccountNumber = normalizeAccountNumber(
        row.setting_value,
        DEFAULT_PLATFORM_SETTINGS.paymentAccountNumber,
      );
    }

    if (row.setting_key === SETTING_KEYS.paymentAccountName) {
      settings.paymentAccountName = normalizeTextSetting(
        row.setting_value,
        DEFAULT_PLATFORM_SETTINGS.paymentAccountName,
      );
    }
  }

  settings.platformCommissionRate = settings.onlineCommissionRate;

  return settings;
}

async function upsertSettings(entries) {
  const placeholders = entries.map(() => "(?, ?)").join(", ");
  const values = entries.flat();

  await db.promise().query(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    values,
  );
}

async function ensureDefaultSettings() {
  await db.promise().query(
    `CREATE TABLE IF NOT EXISTS app_settings (
      id INT NOT NULL AUTO_INCREMENT,
      setting_key VARCHAR(100) NOT NULL,
      setting_value VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY idx_app_settings_key (setting_key)
    )`,
  );

  await upsertSettings([
    [
      SETTING_KEYS.usdToVndRate,
      String(DEFAULT_PLATFORM_SETTINGS.usdToVndRate),
    ],
    [
      SETTING_KEYS.onlineCommissionRate,
      String(DEFAULT_PLATFORM_SETTINGS.onlineCommissionRate),
    ],
    [
      SETTING_KEYS.directCommissionRate,
      String(DEFAULT_PLATFORM_SETTINGS.directCommissionRate),
    ],
    [
      SETTING_KEYS.legacyPlatformCommissionRate,
      String(DEFAULT_PLATFORM_SETTINGS.onlineCommissionRate),
    ],
    [
      SETTING_KEYS.paymentBankCode,
      DEFAULT_PLATFORM_SETTINGS.paymentBankCode,
    ],
    [
      SETTING_KEYS.paymentBankName,
      DEFAULT_PLATFORM_SETTINGS.paymentBankName,
    ],
    [
      SETTING_KEYS.paymentAccountNumber,
      DEFAULT_PLATFORM_SETTINGS.paymentAccountNumber,
    ],
    [
      SETTING_KEYS.paymentAccountName,
      DEFAULT_PLATFORM_SETTINGS.paymentAccountName,
    ],
  ]);
}

PlatformSetting.getPlatformSettings = async () => {
  try {
    await ensureDefaultSettings();

    const keyPlaceholders = PLATFORM_SETTING_KEYS.map(() => "?").join(", ");
    const [rows] = await db.promise().query(
      `SELECT setting_key, setting_value
       FROM app_settings
       WHERE setting_key IN (${keyPlaceholders})`,
      PLATFORM_SETTING_KEYS,
    );

    return buildSettingsResponse(rows);
  } catch (error) {
    throw error;
  }
};

PlatformSetting.updatePlatformSettings = async (payload) => {
  await ensureDefaultSettings();

  await upsertSettings([
    [
      SETTING_KEYS.usdToVndRate,
      String(normalizeUsdToVndRate(payload.usdToVndRate)),
    ],
    [
      SETTING_KEYS.onlineCommissionRate,
      String(normalizeCommissionRate(payload.onlineCommissionRate)),
    ],
    [
      SETTING_KEYS.directCommissionRate,
      String(
        normalizeCommissionRate(
          payload.directCommissionRate,
          getDefaultDirectCommissionRate(),
        ),
      ),
    ],
    [
      SETTING_KEYS.legacyPlatformCommissionRate,
      String(normalizeCommissionRate(payload.onlineCommissionRate)),
    ],
    [
      SETTING_KEYS.paymentBankCode,
      normalizeBankCode(
        payload.paymentBankCode,
        DEFAULT_PLATFORM_SETTINGS.paymentBankCode,
      ),
    ],
    [
      SETTING_KEYS.paymentBankName,
      normalizeTextSetting(
        payload.paymentBankName,
        DEFAULT_PLATFORM_SETTINGS.paymentBankName,
      ),
    ],
    [
      SETTING_KEYS.paymentAccountNumber,
      normalizeAccountNumber(
        payload.paymentAccountNumber,
        DEFAULT_PLATFORM_SETTINGS.paymentAccountNumber,
      ),
    ],
    [
      SETTING_KEYS.paymentAccountName,
      normalizeTextSetting(
        payload.paymentAccountName,
        DEFAULT_PLATFORM_SETTINGS.paymentAccountName,
      ),
    ],
  ]);

  return PlatformSetting.getPlatformSettings();
};

module.exports = PlatformSetting;
