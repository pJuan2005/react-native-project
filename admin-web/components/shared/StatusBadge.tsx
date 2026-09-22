interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status.toLowerCase();
  const cls =
    s === "pending"
      ? "hs-badge hs-badge-pending"
      : s === "approved" || s === "confirmed" || s === "active"
      ? "hs-badge hs-badge-approved"
      : s === "rejected" || s === "cancelled" || s === "blocked"
      ? "hs-badge hs-badge-rejected"
      : s === "guest"
      ? "hs-badge hs-badge-guest"
      : s === "host"
      ? "hs-badge hs-badge-host"
      : s === "admin"
      ? "hs-badge hs-badge-admin"
      : "hs-badge hs-badge-pending";

  return <span className={cls}>{status}</span>;
}
