import { apiRequest } from "@/lib/apiClient";

export interface DisputeItem {
  id: number;
  reporter_id: number;
  reporter_role: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  target_type: "property" | "booking" | "user" | "payment";
  target_id: number;
  booking_id?: number | null;
  reason: string;
  description: string;
  evidence_url?: string | null;
  status: "pending" | "investigating" | "resolved" | "rejected";
  admin_note?: string | null;
  resolution_action?: string | null;
  resolved_by?: number | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export async function getAdminDisputes(params?: {
  status?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}): Promise<DisputeItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.targetType && params.targetType !== "all") query.append("targetType", params.targetType);
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.offset) query.append("offset", String(params.offset));

  const url = `/api/disputes${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await apiRequest<any>(url);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function resolveAdminDispute(
  id: number,
  payload: {
    status: "investigating" | "resolved" | "rejected";
    adminNote: string;
    resolutionAction?: string;
  }
): Promise<any> {
  return apiRequest<any>(`/api/disputes/${id}/resolve`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
