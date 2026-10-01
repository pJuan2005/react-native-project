import { apiRequest } from "@/lib/apiClient";

export interface PlatformSettings {
  usdToVndRate: number;
  onlineCommissionRate: number;
  directCommissionRate: number;
  onlineCommissionPercent: number;
  directCommissionPercent: number;
  platformCommissionRate: number;
  platformCommissionPercent: number;
  paymentBankCode: string;
  paymentBankName: string;
  paymentAccountNumber: string;
  paymentAccountName: string;
}

interface PlatformSettingsResponse {
  message?: string;
  settings: PlatformSettings;
}

export interface UpdatePlatformSettingsPayload {
  usdToVndRate: number;
  onlineCommissionPercent: number;
  directCommissionPercent: number;
  paymentBankCode: string;
  paymentBankName: string;
  paymentAccountNumber: string;
  paymentAccountName: string;
}

type PlatformSettingsApiPayload =
  | {
      usdToVndRate?: unknown;
      onlineCommissionRate?: unknown;
      directCommissionRate?: unknown;
      onlineCommissionPercent?: unknown;
      directCommissionPercent?: unknown;
      platformCommissionRate?: unknown;
      platformCommissionPercent?: unknown;
      paymentBankCode?: unknown;
      paymentBankName?: unknown;
      paymentAccountNumber?: unknown;
      paymentAccountName?: unknown;
    }
  | null
  | undefined;

function mapPlatformSettings(payload: PlatformSettingsApiPayload): PlatformSettings {
  return {
    usdToVndRate: Number(payload?.usdToVndRate || 25000),
    onlineCommissionRate: Number(
      payload?.onlineCommissionRate ?? payload?.platformCommissionRate ?? 0.1,
    ),
    directCommissionRate: Number(payload?.directCommissionRate || 0.05),
    onlineCommissionPercent: Number(
      (payload?.onlineCommissionPercent ?? payload?.platformCommissionPercent) || 10,
    ),
    directCommissionPercent: Number(payload?.directCommissionPercent || 5),
    platformCommissionRate: Number(payload?.platformCommissionRate || 0.1),
    platformCommissionPercent: Number(payload?.platformCommissionPercent || 10),
    paymentBankCode: String(payload?.paymentBankCode || "TCB"),
    paymentBankName: String(payload?.paymentBankName || "Techcombank"),
    paymentAccountNumber: String(payload?.paymentAccountNumber || "19071766471019"),
    paymentAccountName: String(payload?.paymentAccountName || "PHAM XUAN CHUAN"),
  };
}

export async function getAdminPlatformSettings() {
  const response = await apiRequest<PlatformSettingsResponse>("/api/admin/settings");

  return {
    settings: mapPlatformSettings(response.settings),
  };
}

export async function updateAdminPlatformSettings(
  payload: UpdatePlatformSettingsPayload,
) {
  const response = await apiRequest<PlatformSettingsResponse>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return {
    message: response.message || "Platform settings updated successfully.",
    settings: mapPlatformSettings(response.settings),
  };
}
