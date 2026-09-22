"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Pencil,
  Save,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
  getAdminUsers,
  updateAdminUser,
  type AdminUserRecord,
} from "@/services/adminUserService";

const ITEMS_PER_PAGE = 8;

type RoleFilter = "All" | "Guest" | "Host" | "Admin";
type StatusFilter = "All" | "Active" | "Blocked";

interface EditFormState {
  fullName: string;
  email: string;
  role: "guest" | "host" | "admin";
  status: "active" | "blocked";
  phone: string;
  location: string;
  website: string;
  languages: string;
  bio: string;
}

function buildEditForm(user: AdminUserRecord): EditFormState {
  return {
    fullName: user.name,
    email: user.email,
    role: user.role.toLowerCase() as EditFormState["role"],
    status: user.status.toLowerCase() as EditFormState["status"],
    phone: user.phone || "",
    location: user.location || "",
    website: user.website || "",
    languages: user.languages || "",
    bio: user.bio || "",
  };
}

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMessage, setPageMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await getAdminUsers();
      setUserList(data);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load the user list right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword);
      const matchRole = roleFilter === "All" || user.role === roleFilter;
      const matchStatus = statusFilter === "All" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [roleFilter, search, statusFilter, userList]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const roleCounts = {
    All: userList.length,
    Guest: userList.filter((user) => user.role === "Guest").length,
    Host: userList.filter((user) => user.role === "Host").length,
    Admin: userList.filter((user) => user.role === "Admin").length,
  };

  function openEditModal(user: AdminUserRecord) {
    setSelectedUser(user);
    setEditForm(buildEditForm(user));
    setPageError("");
    setPageMessage("");
  }

  function closeEditModal() {
    setSelectedUser(null);
    setEditForm(null);
  }

  function updateUserInList(updatedUser: AdminUserRecord) {
    setUserList((currentList) =>
      currentList.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }

  async function handleToggleStatus(user: AdminUserRecord) {
    setUpdatingStatusId(user.id);
    setPageError("");
    setPageMessage("");

    try {
      const response = await updateAdminUser(user.id, {
        fullName: user.name,
        email: user.email,
        role: user.role.toLowerCase() as "guest" | "host" | "admin",
        status: user.status === "Active" ? "blocked" : "active",
        phone: user.phone || "",
        location: user.location || "",
        website: user.website || "",
        languages: user.languages || "",
        bio: user.bio || "",
      });

      updateUserInList(response.data);
      setPageMessage(response.message);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to update the user status right now.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSaveUser(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedUser || !editForm) {
      return;
    }

    setIsSavingUser(true);
    setPageError("");
    setPageMessage("");

    try {
      const response = await updateAdminUser(selectedUser.id, editForm);
      updateUserInList(response.data);
      setPageMessage(response.message);
      closeEditModal();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to save this user right now.",
      );
    } finally {
      setIsSavingUser(false);
    }
  }

  const isEditingCurrentAdmin = selectedUser?.id === currentUser?.id;

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
          Manage Users
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          {userList.length} registered users on the platform
        </p>
      </div>

      {(pageError || pageMessage) && (
        <div
          style={{
            marginBottom: 18,
            borderRadius: 12,
            padding: "12px 14px",
            border: `1px solid ${pageError ? "#fecaca" : "#bbf7d0"}`,
            background: pageError ? "#fef2f2" : "#f0fdf4",
            color: pageError ? "#b91c1c" : "#166534",
            fontSize: "0.84rem",
          }}
        >
          {pageError || pageMessage}
        </div>
      )}

      <div className="row g-3 mb-4">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="col-6 col-md-3">
            <div className="hs-stat-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b" }}>
                {count}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                {role === "All" ? "Total Users" : `${role}s`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            className="hs-form-control"
            placeholder="Search by name, email, or phone..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
            Role:
          </span>
          {(["All", "Guest", "Host", "Admin"] as RoleFilter[]).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                border: `1.5px solid ${roleFilter === role ? "#2563EB" : "#e2e8f0"}`,
                background: roleFilter === role ? "#eff6ff" : "#fff",
                color: roleFilter === role ? "#2563EB" : "#64748b",
                fontWeight: roleFilter === role ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {role}
            </button>
          ))}

          <span
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            Status:
          </span>
          {(["All", "Active", "Blocked"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                border: `1.5px solid ${statusFilter === status ? "#2563EB" : "#e2e8f0"}`,
                background: statusFilter === status ? "#eff6ff" : "#fff",
                color: statusFilter === status ? "#2563EB" : "#64748b",
                fontWeight: statusFilter === status ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="hs-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.87rem",
              color: "#64748b",
            }}
          >
            <Users size={15} /> Showing {paginatedUsers.length} of{" "}
            {filteredUsers.length} filtered users
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="hs-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isCurrentAdmin = user.id === currentUser?.id;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background:
                                user.role === "Admin"
                                  ? "linear-gradient(135deg, #7c3aed, #2563EB)"
                                  : user.role === "Host"
                                  ? "linear-gradient(135deg, #2563EB, #0ea5e9)"
                                  : "linear-gradient(135deg, #16a34a, #0891b2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              flexShrink: 0,
                            }}
                          >
                            {user.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                              {user.name}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>ID #{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.87rem", color: "#475569" }}>{user.email}</td>
                      <td>
                        <StatusBadge status={user.role} />
                      </td>
                      <td style={{ fontSize: "0.83rem", color: "#64748b" }}>
                        {formatJoinedDate(user.joined)}
                      </td>
                      <td style={{ fontSize: "0.83rem", color: "#64748b" }}>
                        {user.role === "Host" && (
                          <span>
                            {user.propertyCount} props • {user.bookingCount} bookings
                          </span>
                        )}
                        {user.role === "Guest" && (
                          <span>{user.bookingCount} bookings</span>
                        )}
                        {user.role === "Admin" && <span>Full access</span>}
                      </td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "6px 12px",
                              borderRadius: 7,
                              border: "1.5px solid #dbeafe",
                              background: "#eff6ff",
                              color: "#2563EB",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.role === "Admin" || isCurrentAdmin || updatingStatusId === user.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "6px 12px",
                              borderRadius: 7,
                              border: "none",
                              background: user.status === "Active" ? "#fee2e2" : "#dcfce7",
                              color: user.status === "Active" ? "#dc2626" : "#16a34a",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor:
                                user.role === "Admin" || isCurrentAdmin
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                user.role === "Admin" || isCurrentAdmin || updatingStatusId === user.id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {user.status === "Active" ? (
                              <>
                                <UserX size={13} /> Block
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} /> Unblock
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        pageSize={ITEMS_PER_PAGE}
        itemLabel="users"
        onPageChange={setCurrentPage}
      />

      {selectedUser && editForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.52)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 880,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 20,
              background: "#fff",
              padding: 24,
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: "1.15rem" }}>
                  Edit User
                </h3>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  Update account details, role, and status for {selectedUser.name}.
                </p>
              </div>
              <button
                type="button"
                className="btn-outline-hs"
                onClick={closeEditModal}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <X size={14} /> Close
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="hs-form-label">Full Name</label>
                  <input
                    className="hs-form-control"
                    value={editForm.fullName}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, fullName: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="hs-form-label">Email</label>
                  <input
                    className="hs-form-control"
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, email: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="hs-form-label">Phone Number</label>
                  <input
                    className="hs-form-control"
                    value={editForm.phone}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, phone: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="hs-form-label">Role</label>
                  <select
                    className="hs-form-control"
                    value={editForm.role}
                    disabled={isEditingCurrentAdmin}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              role: event.target.value as EditFormState["role"],
                            }
                          : current,
                      )
                    }
                  >
                    <option value="guest">Guest</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="hs-form-label">Status</label>
                  <select
                    className="hs-form-control"
                    value={editForm.status}
                    disabled={isEditingCurrentAdmin}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              status: event.target.value as EditFormState["status"],
                            }
                          : current,
                      )
                    }
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="hs-form-label">Location</label>
                  <input
                    className="hs-form-control"
                    value={editForm.location}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, location: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="hs-form-label">Website</label>
                  <input
                    className="hs-form-control"
                    value={editForm.website}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, website: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="hs-form-label">Languages</label>
                  <input
                    className="hs-form-control"
                    value={editForm.languages}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, languages: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="hs-form-label">Bio</label>
                  <textarea
                    className="hs-form-control"
                    rows={4}
                    value={editForm.bio}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, bio: event.target.value }
                          : current,
                      )
                    }
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {isEditingCurrentAdmin && (
                <div
                  style={{
                    marginTop: 16,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#c2410c",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: "0.83rem",
                  }}
                >
                  Your own admin role and status are protected here. Use the profile
                  screen for personal updates only.
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  className="btn-outline-hs"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-hs"
                  disabled={isSavingUser}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Save size={14} />
                  {isSavingUser ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
