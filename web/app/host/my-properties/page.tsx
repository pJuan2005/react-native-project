"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Eye,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useAuth } from "@/components/context/AuthContext";
import { isBackendUploadImage } from "@/lib/image";
import {
  deleteHostProperty,
  getHostProperties,
  type PropertySummary,
} from "@/services/propertyService";

const ITEMS_PER_PAGE = 6;

export default function MyPropertiesPage() {
  const { user, isInitializing } = useAuth();
  const hostId = user?.id;
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function fetchProperties() {
      if (!hostId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getHostProperties(hostId);
        if (mounted) {
          setProperties(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProperties();

    return () => {
      mounted = false;
    };
  }, [hostId]);

  const stats = useMemo(
    () => ({
      total: properties.length,
      pending: properties.filter((property) => property.status === "pending").length,
      approved: properties.filter((property) => property.status === "approved").length,
      rejected: properties.filter((property) => property.status === "rejected").length,
    }),
    [properties],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [properties.length]);

  const totalPages = Math.max(1, Math.ceil(properties.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProperties = properties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  async function handleDelete(id: number) {
    try {
      await deleteHostProperty(id, hostId);
      setProperties((prev) => prev.filter((property) => property.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirm(null);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <svg
            style={{
              animation: "spin 1s linear infinite",
              width: 36,
              height: 36,
              marginBottom: 16,
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <p style={{ color: "#64748b" }}>Loading property list...</p>
        </div>
      </div>
    );
  }

  if (isInitializing || !user) {
    return (
      <div
        style={{
          padding: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "#64748b",
        }}
      >
        Checking host session...
      </div>
    );
  }

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: 4,
              fontSize: "1.5rem",
            }}
          >
            My Properties
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            {stats.total} properties under management
          </p>
        </div>
        <Link href="/host/add-property">
          <button
            className="btn-primary-hs"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> Add New Property
          </button>
        </Link>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: "Total", value: stats.total, color: "#2563EB", bg: "#eff6ff" },
          {
            label: "Pending Review",
            value: stats.pending,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Approved",
            value: stats.approved,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            color: "#dc2626",
            bg: "#fee2e2",
          },
        ].map((item) => (
          <div key={item.label} className="col-6 col-md-3">
            <div
              style={{
                background: item.bg,
                borderRadius: 10,
                padding: "14px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
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

      <div className="row g-4">
        {properties.length === 0 ? (
          <div className="col-12" style={{ textAlign: "center", padding: "60px 0" }}>
            <h3 style={{ color: "#1e293b" }}>You do not have any properties yet.</h3>
            <p style={{ color: "#64748b" }}>
              Start by creating your first property.
            </p>
            <Link href="/host/add-property">
              <button className="btn-primary-hs" style={{ marginTop: 12 }}>
                Add Property
              </button>
            </Link>
          </div>
        ) : (
          paginatedProperties.map((property) => (
            <div key={property.id} className="col-xl-4 col-lg-6">
              <div className="hs-card" style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
                  <StatusBadge status={property.status} />
                </div>

                <div style={{ overflow: "hidden" }}>
                  <Image
                    src={property.image}
                    alt={property.title}
                    width={720}
                    height={456}
                    sizes="(max-width: 992px) 100vw, (max-width: 1400px) 50vw, 33vw"
                    unoptimized={isBackendUploadImage(property.image)}
                    style={{ width: "100%", height: 190, objectFit: "cover" }}
                  />
                </div>

                <div style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: "0.97rem",
                        flex: 1,
                        lineHeight: 1.35,
                      }}
                    >
                      {property.title}
                    </h3>
                    <span
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        color: "#1e293b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${property.price}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          fontWeight: 400,
                        }}
                      >
                        /night
                      </span>
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 10,
                    }}
                  >
                    <MapPin size={12} color="#94a3b8" />
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {property.location}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        color: "#64748b",
                      }}
                    >
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      {property.rating.toFixed(1)} ({property.reviews})
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {property.maxGuests} guests
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {property.bedrooms} bedrooms
                    </div>
                  </div>

                  {property.status === "pending" && (
                    <div
                      style={{
                        background: "#fef3c7",
                        borderRadius: 8,
                        padding: "8px 12px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.78rem",
                        color: "#92400e",
                      }}
                    >
                      <AlertTriangle size={13} />
                      This property is waiting for admin approval.
                    </div>
                  )}

                  {property.status === "rejected" && (
                    <div
                      style={{
                        background: "#fee2e2",
                        borderRadius: 8,
                        padding: "8px 12px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.78rem",
                        color: "#991b1b",
                      }}
                    >
                      <AlertTriangle size={13} />
                      This property was rejected. Please update it and submit again.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/host/properties/${property.id}`} style={{ flex: 1 }}>
                      <button
                        style={{
                          width: "100%",
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px",
                          fontSize: "0.82rem",
                          color: "#475569",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </Link>

                    <Link href={`/host/edit-property/${property.id}`} style={{ flex: 1 }}>
                      <button
                        style={{
                          width: "100%",
                          background: "#eff6ff",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px",
                          fontSize: "0.82rem",
                          color: "#2563EB",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </Link>

                    {deleteConfirm === property.id ? (
                      <div style={{ display: "flex", gap: 4, flex: 1 }}>
                        <button
                          onClick={() => handleDelete(property.id)}
                          style={{
                            flex: 1,
                            background: "#dc2626",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontSize: "0.8rem",
                            color: "#fff",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            flex: 1,
                            background: "#f1f5f9",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontSize: "0.8rem",
                            color: "#64748b",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(property.id)}
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    )}
                  </div>

                  {property.status === "approved" &&
                    property.manageToken &&
                    property.manageTokenActive && (
                    <div style={{ marginTop: 10 }}>
                      <Link
                        href={`/quick-manage/${property.manageToken}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <button
                          style={{
                            width: "100%",
                            background: "#f8fafc",
                            border: "1px dashed #93c5fd",
                            borderRadius: 8,
                            padding: "8px 12px",
                            fontSize: "0.8rem",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <ExternalLink size={13} /> Quick Manage Link
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PaginationControls
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={properties.length}
        pageSize={ITEMS_PER_PAGE}
        itemLabel="properties"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
