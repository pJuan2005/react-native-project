interface PaymentStatusBadgeProps {
  status: string;
}

const paymentStatusMap: Record<
  string,
  { className: string; label: string }
> = {
  unpaid: {
    className: "hs-badge hs-badge-pending",
    label: "Unpaid",
  },
  proof_uploaded: {
    className: "hs-badge hs-badge-pending",
    label: "Proof Uploaded",
  },
  verified: {
    className: "hs-badge hs-badge-approved",
    label: "Verified",
  },
  rejected: {
    className: "hs-badge hs-badge-rejected",
    label: "Rejected",
  },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const config =
    paymentStatusMap[normalizedStatus] || paymentStatusMap.unpaid;

  return <span className={config.className}>{config.label}</span>;
}
