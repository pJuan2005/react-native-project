import { apiRequest } from "@/lib/apiClient";
import {
  mapAuthUser,
  type AuthRole,
  type AuthStatus,
} from "@/services/authService";

interface ApiAdminUser {
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
  bookingCount?: number | null;
  propertyCount?: number | null;
}

export interface AdminUserRecord {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  joined: string;
  phone: string;
  location: string;
  website: string;
  languages: string;
  bio: string;
  bookingCount: number;
  propertyCount: number;
}

function mapAdminUser(user: ApiAdminUser): AdminUserRecord {
  const authUser = mapAuthUser(user);

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    status: authUser.status,
    joined: authUser.joined,
    phone: authUser.phone || "",
    location: authUser.location || "",
    website: authUser.website || "",
    languages: authUser.languages || "",
    bio: authUser.bio || "",
    bookingCount: Number(user.bookingCount || 0),
    propertyCount: Number(user.propertyCount || 0),
  };
}

export async function getAdminUsers() {
  const response = await apiRequest<ApiAdminUser[]>("/api/admin/users");
  return response.map(mapAdminUser);
}

export async function getAdminUserById(id: number | string) {
  const response = await apiRequest<ApiAdminUser>(`/api/admin/users/${id}`);
  return mapAdminUser(response);
}

export async function updateAdminUser(
  id: number,
  payload: {
    fullName: string;
    email: string;
    role: Lowercase<AuthRole>;
    status: Lowercase<AuthStatus>;
    phone: string;
    location?: string;
    website?: string;
    languages?: string;
    bio?: string;
  },
) {
  const response = await apiRequest<{ message: string; data: ApiAdminUser }>(
    `/api/admin/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return {
    ...response,
    data: mapAdminUser(response.data),
  };
}
