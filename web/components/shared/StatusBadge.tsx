interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Đang chờ xử lý", className: "hs-badge hs-badge-pending" },
  approved: { label: "Đã duyệt", className: "hs-badge hs-badge-approved" },
  confirmed: { label: "Đã xác nhận", className: "hs-badge hs-badge-approved" },
  completed: { label: "Hoàn thành", className: "hs-badge hs-badge-approved" },
  active: { label: "Đang hoạt động", className: "hs-badge hs-badge-approved" },
  rejected: { label: "Từ chối", className: "hs-badge hs-badge-rejected" },
  cancelled: { label: "Đã hủy", className: "hs-badge hs-badge-rejected" },
  blocked: { label: "Bị khóa", className: "hs-badge hs-badge-rejected" },
  guest: { label: "Khách hàng", className: "hs-badge hs-badge-guest" },
  host: { label: "Chủ nhà", className: "hs-badge hs-badge-host" },
  admin: { label: "Quản trị viên", className: "hs-badge hs-badge-admin" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = String(status || "").toLowerCase().trim();
  const config = statusMap[s] || { label: status, className: "hs-badge hs-badge-pending" };

  return <span className={config.className}>{config.label}</span>;
}
