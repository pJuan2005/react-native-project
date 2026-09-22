function normalizeMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function getDefaultUsdToVndRate() {
  const parsed = Number(process.env.USD_TO_VND_RATE || 25000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25000;
}

function getDefaultOnlineCommissionRate() {
  const parsed = Number(process.env.PLATFORM_COMMISSION_RATE || 0.1);
  return Number.isFinite(parsed) && parsed >= 0 && parsed < 1 ? parsed : 0.1;
}

function getDefaultDirectCommissionRate() {
  const parsed = Number(process.env.DIRECT_COMMISSION_RATE || 0.05);
  return Number.isFinite(parsed) && parsed >= 0 && parsed < 1 ? parsed : 0.05;
}

function normalizeUsdToVndRate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? normalizeMoney(parsed)
    : getDefaultUsdToVndRate();
}

function normalizeCommissionRate(value, fallback = getDefaultOnlineCommissionRate()) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed < 1
    ? Number(parsed.toFixed(4))
    : fallback;
}

function normalizePlatformCommissionRate(value) {
  return normalizeCommissionRate(value, getDefaultOnlineCommissionRate());
}

function convertUsdToVnd(amountUsd, exchangeRate = getDefaultUsdToVndRate()) {
  return Math.round(Number(amountUsd || 0) * normalizeUsdToVndRate(exchangeRate));
}

function calculateRevenueSplit(
  grossRevenue,
  commissionRate = getDefaultOnlineCommissionRate(),
) {
  const gross = normalizeMoney(grossRevenue);
  const normalizedCommissionRate = normalizeCommissionRate(commissionRate);
  const platformRevenue = normalizeMoney(gross * normalizedCommissionRate);
  const hostPayout = normalizeMoney(gross - platformRevenue);

  return {
    grossRevenue: gross,
    platformCommissionRate: normalizedCommissionRate,
    platformRevenue,
    hostPayout,
  };
}

function resolveRevenueSplitForRow(row, fallbackCommissionRate) {
  const grossRevenue = normalizeMoney(row?.totalPrice || 0);
  const commissionAmount = Number(row?.commissionAmount);
  const hostPayoutAmount = Number(row?.hostPayoutAmount);

  if (Number.isFinite(commissionAmount) && Number.isFinite(hostPayoutAmount)) {
    const gross = normalizeMoney(commissionAmount + hostPayoutAmount);
    const rate =
      gross > 0 ? Number((commissionAmount / gross).toFixed(4)) : normalizeCommissionRate(fallbackCommissionRate);

    return {
      grossRevenue: gross,
      platformCommissionRate: rate,
      platformRevenue: normalizeMoney(commissionAmount),
      hostPayout: normalizeMoney(hostPayoutAmount),
    };
  }

  const commissionRate = normalizeCommissionRate(
    row?.commissionRateApplied,
    normalizeCommissionRate(fallbackCommissionRate),
  );

  return calculateRevenueSplit(grossRevenue, commissionRate);
}

function calculateRevenueTotals(rows, commissionRate) {
  return (Array.isArray(rows) ? rows : []).reduce(
    (totals, row) => {
      const split = resolveRevenueSplitForRow(row, commissionRate);
      totals.grossRevenue = normalizeMoney(totals.grossRevenue + split.grossRevenue);
      totals.platformRevenue = normalizeMoney(
        totals.platformRevenue + split.platformRevenue,
      );
      totals.hostPayout = normalizeMoney(totals.hostPayout + split.hostPayout);

      return totals;
    },
    {
      grossRevenue: 0,
      platformRevenue: 0,
      hostPayout: 0,
      platformCommissionRate: normalizeCommissionRate(commissionRate),
    },
  );
}

module.exports = {
  normalizeMoney,
  getDefaultUsdToVndRate,
  getDefaultOnlineCommissionRate,
  getDefaultDirectCommissionRate,
  getDefaultPlatformCommissionRate: getDefaultOnlineCommissionRate,
  normalizeUsdToVndRate,
  normalizeCommissionRate,
  normalizePlatformCommissionRate,
  convertUsdToVnd,
  calculateRevenueSplit,
  resolveRevenueSplitForRow,
  calculateRevenueTotals,
};
