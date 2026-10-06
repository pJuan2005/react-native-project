import { apiRequest } from "@/lib/apiClient";

export interface AuditLogItem {
  id: number;
  actor_id: number | null;
  actor_name?: string | null;
  actor_email?: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: string | null;
  ip_address: string | null;
  created_at: string;
}

export async function getAdminAuditLogs(limit = 100, offset = 0) {
  return apiRequest<AuditLogItem[]>(`/api/admin/audit-logs?limit=${limit}&offset=${offset}`);
}
