"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Bath,
  Bed,
  CheckCircle,
  Eye,
  MapPin,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  getAdminProperties,
  getAdminPropertyById,
  updatePropertyStatus,
  type PropertySummary,
} from "@/services/propertyService";
import { isBackendUploadImage } from "@/lib/image";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaginationControls } from "@/components/shared/PaginationControls";

type AdminPropertyDetail = Awaited<ReturnType<typeof getAdminPropertyById>>;
const PENDING_ITEMS_PER_PAGE = 8;
const HANDLED_ITEMS_PER_PAGE = 5;

export default function PropertyApprovalsPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPropertyId, setProcessingPropertyId] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<AdminPropertyDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [rejectingProperty, setRejectingProperty] = useState<PropertySummary | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [handledPage, setHandledPage] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getAdminProperties();
      setProperties(data);
    } catch (_error) {
      setErrorMessage("Unable to load pending properties.");
    } finally {
      setLoading(false);
    }
  }

  const pending = useMemo(
    () => properties.filter((property) => property.status.toLowerCase() === "pending"),
    [properties],
  );

  const recentlyHandled = useMemo(
    () => properties.filter((property) => property.status.toLowerCase() !== "pending"),
    [properties],
  );

  useEffect(() => {
    setPendingPage(1);
  }, [pending.length]);

  useEffect(() => {
    setHandledPage(1);
  }, [recentlyHandled.length]);

  const pendingTotalPages = Math.max(
    1,
    Math.ceil(pending.length / PENDING_ITEMS_PER_PAGE),
  );
  const safePendingPage = Math.min(pendingPage, pendingTotalPages);
  const paginatedPending = pending.slice(
    (safePendingPage - 1) * PENDING_ITEMS_PER_PAGE,
    safePendingPage * PENDING_ITEMS_PER_PAGE,
  );

  const handledTotalPages = Math.max(
    1,
    Math.ceil(recentlyHandled.length / HANDLED_ITEMS_PER_PAGE),
  );
  const safeHandledPage = Math.min(handledPage, handledTotalPages);
  const paginatedHandled = recentlyHandled.slice(
    (safeHandledPage - 1) * HANDLED_ITEMS_PER_PAGE,
    safeHandledPage * HANDLED_ITEMS_PER_PAGE,
  );

  async function openDetail(id: number) {
    try {
      setIsDetailLoading(true);
      const data = await getAdminPropertyById(id);
      setSelectedProperty(data);
    } catch (_error) {
      setNotice("Unable to load the property details.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function updateStatus(id: number, status: "approved" | "rejected") {
    try {
      setProcessingPropertyId(id);
      await updatePropertyStatus(id, status);
      setProperties((prev) =>
        prev.map((property) =>
          property.id === id ? { ...property, status } : property,
        ),
      );

      if (selectedProperty?.id === id) {
        setSelectedProperty((prev) => (prev ? { ...prev, status } : prev));
      }

      setNotice(
        status === "approved"
          ? "Property approved successfully."
          : "Property rejected successfully.",
      );
    } catch (_error) {
      setNotice("Unable to update the property status.");
    } finally {
      setProcessingPropertyId(null);
    }
  }

  async function approveProperty(id: number) {
    await updateStatus(id, "approved");
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
  }

  async function rejectProperty() {
    if (!rejectingProperty) {
      return;
    }

    await updateStatus(rejectingProperty.id, "rejected");
    setRejectingProperty(null);
    setRejectionReason("");
  }

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 4,
            fontSize: "1.5rem",
          }}
        >
          Property Approvals
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Review and approve new property submissions from hosts.
        </p>
      </div>

      {notice && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="row g-3 mb-4">
        {[
          {
            label: "Pending",
            value: pending.length,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Approved",
            value: properties.filter((property) => property.status === "approved").length,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Rejected",
            value: properties.filter((property) => property.status === "rejected").length,
            color: "#dc2626",
            bg: "#fee2e2",
          },
          {
            label: "Total",
            value: properties.length,
            color: "#2563eb",
            bg: "#eff6ff",
          },
        ].map((item) => (
          <div key={item.label} className="col-6 col-md-3">
            <div
              style={{
                background: item.bg,
                borderRadius: 10,
                padding: "16px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: item.color,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hs-card" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#d97706",
            }}
          />
          <h3
            style={{
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
              fontSize: "1rem",
            }}
          >
            Pending submissions ({pending.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            Loading data...
          </div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            <CheckCircle size={40} color="#16a34a" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#1e293b" }}>
              No properties are waiting for approval.
            </div>
            <div style={{ fontSize: "0.87rem" }}>
              All recent submissions have already been handled.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Host</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPending.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Image
                          src={property.image}
                          alt={property.title}
                          width={48}
                          height={48}
                          sizes="48px"
                          unoptimized={isBackendUploadImage(property.image)}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#1e293b",
                              fontSize: "0.88rem",
                              maxWidth: 180,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {property.title}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                            ID #{property.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.87rem", color: "#475569" }}>
                      {property.hostName}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        <MapPin size={12} color="#94a3b8" />
                        {property.city}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 20,
                        }}
                      >
                        {property.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      ${property.price}
                      <span
                        style={{
                          color: "#94a3b8",
                          fontWeight: 400,
                          fontSize: "0.78rem",
                        }}
                      >
                        /night
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      <div>{property.maxGuests} guests</div>
                      <div>{property.bedrooms} bedrooms</div>
                    </td>
                    <td>
                      <StatusBadge status={property.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => openDetail(property.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 10px",
                            borderRadius: 7,
                            border: "1.5px solid #e2e8f0",
                            background: "#fff",
                            color: "#64748b",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={13} />
                          View
                        </button>
                        <button
                          onClick={() => approveProperty(property.id)}
                          disabled={processingPropertyId === property.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 10px",
                            borderRadius: 7,
                            border: "none",
                            background: "#dcfce7",
                            color: "#16a34a",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            opacity: processingPropertyId === property.id ? 0.7 : 1,
                          }}
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingProperty(property)}
                          disabled={processingPropertyId === property.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 10px",
                            borderRadius: 7,
                            border: "none",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            opacity: processingPropertyId === property.id ? 0.7 : 1,
                          }}
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: "0 20px 20px" }}>
          <PaginationControls
            currentPage={safePendingPage}
            totalPages={pendingTotalPages}
            totalItems={pending.length}
            pageSize={PENDING_ITEMS_PER_PAGE}
            itemLabel="pending properties"
            onPageChange={setPendingPage}
          />
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <h3
            style={{
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
              fontSize: "1rem",
            }}
          >
            Recently handled
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Host</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentlyHandled.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                    No processed properties yet.
                  </td>
                </tr>
              ) : (
                paginatedHandled.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Image
                          src={property.image}
                          alt={property.title}
                          width={38}
                          height={38}
                          sizes="38px"
                          unoptimized={isBackendUploadImage(property.image)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: "0.87rem",
                          }}
                        >
                          {property.title}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.87rem", color: "#64748b" }}>
                      {property.hostName}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#64748b",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 20,
                        }}
                      >
                        {property.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>
                      ${property.price}/night
                    </td>
                    <td>
                      <StatusBadge status={property.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <PaginationControls
            currentPage={safeHandledPage}
            totalPages={handledTotalPages}
            totalItems={recentlyHandled.length}
            pageSize={HANDLED_ITEMS_PER_PAGE}
            itemLabel="processed properties"
            onPageChange={setHandledPage}
          />
        </div>
      </div>

      {selectedProperty && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 700,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Property details
              </h3>
              <button
                onClick={() => setSelectedProperty(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {isDetailLoading ? (
              <div style={{ padding: "24px", color: "#64748b" }}>
                Loading details...
              </div>
            ) : (
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 240,
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 18,
                  }}
                >
                  <Image
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    fill
                    sizes="(max-width: 992px) 100vw, 700px"
                    unoptimized={isBackendUploadImage(selectedProperty.image)}
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {selectedProperty.images.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    {selectedProperty.images.map((image) => (
                      <div
                        key={image}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: 90,
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={image}
                          alt={selectedProperty.title}
                          fill
                          sizes="(max-width: 768px) 33vw, 120px"
                          unoptimized={isBackendUploadImage(image)}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <h2
                  style={{
                    fontWeight: 800,
                    color: "#1e293b",
                    marginBottom: 8,
                  }}
                >
                  {selectedProperty.title}
                </h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    <MapPin size={14} color="#2563eb" />
                    {selectedProperty.location}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    <Users size={14} />
                    {selectedProperty.maxGuests} guests
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    <Bed size={14} />
                    {selectedProperty.bedrooms} bedrooms
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    <Bath size={14} />
                    {selectedProperty.bathrooms} bathrooms
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {selectedProperty.type}
                  </span>
                  <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}>
                    ${selectedProperty.price}/night
                  </span>
                  <StatusBadge status={selectedProperty.status} />
                </div>

                <p
                  style={{
                    color: "#475569",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    marginBottom: 18,
                  }}
                >
                  {selectedProperty.description}
                </p>

                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: 8,
                      fontSize: "0.9rem",
                    }}
                  >
                    Amenities:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedProperty.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        style={{
                          background: "#f1f5f9",
                          color: "#475569",
                          fontSize: "0.78rem",
                          padding: "4px 10px",
                          borderRadius: 20,
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color: "#64748b",
                    fontSize: "0.85rem",
                    marginBottom: 18,
                  }}
                >
                  Hosted by: {selectedProperty.hostName}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => approveProperty(selectedProperty.id)}
                    className="btn-primary-hs"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: "#16a34a",
                      borderColor: "#16a34a",
                    }}
                  >
                    <CheckCircle size={16} />
                    Approve property
                  </button>
                  <button
                    onClick={() => {
                      setRejectingProperty(selectedProperty);
                      setSelectedProperty(null);
                    }}
                    style={{
                      flex: 1,
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px",
                      color: "#dc2626",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectingProperty && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 440, width: "100%" }}>
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Reject property
              </h3>
              <button
                onClick={() => setRejectingProperty(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 16 }}>
                Add an internal note before rejecting{" "}
                <strong>&quot;{rejectingProperty.title}&quot;</strong>.
              </p>
              <textarea
                className="hs-form-control"
                rows={4}
                placeholder="Example: photos are unclear or the description is incomplete..."
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                style={{ marginBottom: 16, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={rejectProperty}
                  style={{
                    flex: 1,
                    background: "#dc2626",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Confirm rejection
                </button>
                <button
                  onClick={() => setRejectingProperty(null)}
                  className="btn-outline-hs"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
