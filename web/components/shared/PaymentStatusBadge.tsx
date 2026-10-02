interface PaymentStatusBadgeProps {
  status: string;
}

const paymentStatusMap: Record<
  string,
  { className: string; label: string }
> = {
  unpaid: {
    className: "hs-badge hs-badge-pending",
    label: "Chưa thanh toán",
  },
  proof_uploaded: {
    className: "hs-badge hs-badge-pending",
    label: "Đã gửi biên lai",
  },
  verified: {
    className: "hs-badge hs-badge-approved",
    label: "Đã xác minh",
  },
  rejected: {
    className: "hs-badge hs-badge-rejected",
    label: "Từ chối",
  },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const config =
    paymentStatusMap[normalizedStatus] || paymentStatusMap.unpaid;

  return <span className={config.className}>{config.label}</span>;
}
