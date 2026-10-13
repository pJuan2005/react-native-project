import { apiRequest } from "@/lib/apiClient";

export interface HostVerificationItem {
  id: number;
  host_id: number;
  host_name?: string;
  host_email?: string;
  host_phone?: string;
  host_location?: string;
  id_card_number: string;
  id_card_front_url: string;
  id_card_back_url: string;
  business_license_url?: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewer_name?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export async function getHostVerificationStatus(hostId?: number): Promise<HostVerificationItem | null> {
  const query = hostId ? `?hostId=${hostId}` : "";
  const res = await apiRequest<any>(`/api/host/verification${query}`);
  return res?.data || res || null;
}

export async function submitHostVerification(payload: {
  hostId?: number;
  idCardNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  businessLicenseUrl?: string;
}): Promise<any> {
  return apiRequest<any>("/api/host/verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminHostVerifications(status?: string): Promise<HostVerificationItem[]> {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const res = await apiRequest<any>(`/api/admin/host-verifications${query}`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function reviewAdminHostVerification(
  hostId: number,
  payload: {
    decision: "approved" | "rejected";
    rejectionReason?: string;
  }
): Promise<any> {
  return apiRequest<any>(`/api/admin/host-verifications/${hostId}/review`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
