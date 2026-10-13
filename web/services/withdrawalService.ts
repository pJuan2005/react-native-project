import { apiRequest } from "@/lib/apiClient";

export interface WithdrawalItem {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "rejected";
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
}

export async function getAdminWithdrawals(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<WithdrawalItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.offset) query.append("offset", String(params.offset));

  const url = `/api/admin/withdrawals${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await apiRequest<any>(url);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function processAdminWithdrawal(
  id: number,
  payload: {
    status: "completed" | "rejected" | "processing";
    adminNote: string;
  }
): Promise<any> {
  return apiRequest<any>(`/api/admin/withdrawals/${id}/process`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
