import { apiRequest } from "@/lib/apiClient";

export type AuthRole = "Guest" | "Host" | "Admin";
export type AuthStatus = "Active" | "Blocked";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  joined: string;
  phone?: string;
  location?: string;
  website?: string;
  languages?: string;
  bio?: string;
}

interface ApiAuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  languages?: string | null;
  bio?: string | null;
  createdAt?: string | null;
}

interface AuthResponse {
  message: string;
  user: ApiAuthUser;
}

interface MessageResponse {
  message: string;
}

function mapRole(role: string): AuthRole {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") {
    return "Admin";
  }

  if (normalizedRole === "host") {
    return "Host";
  }

  return "Guest";
}

function mapStatus(status: string): AuthStatus {
  return String(status || "").trim().toLowerCase() === "blocked"
    ? "Blocked"
    : "Active";
}

export function mapAuthUser(user: ApiAuthUser): AuthUser {
  return {
    id: Number(user.id),
    name: user.fullName,
    email: user.email,
    role: mapRole(user.role),
    status: mapStatus(user.status),
    joined: user.createdAt || new Date().toISOString(),
    phone: user.phone || "",
    location: user.location || "",
    website: user.website || "",
    languages: user.languages || "",
    bio: user.bio || "",
  };
}

export function getRedirectPath(role: AuthRole) {
  if (role === "Admin") {
    return "/admin/dashboard";
  }

  if (role === "Host") {
    return "/host/dashboard";
  }

  return "/dashboard";
}

export async function login(payload: { email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response,
    user: mapAuthUser(response.user),
  };
}

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: "guest" | "host";
  location?: string;
}) {
  const response = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response,
    user: mapAuthUser(response.user),
  };
}

export async function getCurrentUser() {
  const response = await apiRequest<{ user: ApiAuthUser }>("/api/auth/me");

  return {
    user: mapAuthUser(response.user),
  };
}

export async function logout() {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function updateProfile(payload: {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  languages?: string;
  bio?: string;
}) {
  const response = await apiRequest<AuthResponse>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return {
    ...response,
    user: mapAuthUser(response.user),
  };
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiRequest<MessageResponse>("/api/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
