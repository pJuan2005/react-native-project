"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  totalItems?: number;
  pageSize?: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemLabel = "items",
  totalItems,
  pageSize,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem =
    typeof totalItems === "number" && typeof pageSize === "number"
      ? (currentPage - 1) * pageSize + 1
      : null;
  const endItem =
    typeof totalItems === "number" && typeof pageSize === "number"
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  const pages = [];
  for (
    let page = Math.max(1, currentPage - 2);
    page <= Math.min(totalPages, currentPage + 2);
    page += 1
  ) {
    pages.push(page);
  }

  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
        {startItem && endItem && typeof totalItems === "number"
          ? `Showing ${startItem}-${endItem} of ${totalItems} ${itemLabel}`
          : `Page ${currentPage} of ${totalPages}`}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-outline-hs"
          style={{ padding: "8px 14px", opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: `1px solid ${page === currentPage ? "#2563eb" : "#dbe4f0"}`,
              background: page === currentPage ? "#2563eb" : "#fff",
              color: page === currentPage ? "#fff" : "#475569",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-outline-hs"
          style={{ padding: "8px 14px", opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
