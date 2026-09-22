"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  getRedirectPath,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  type AuthUser,
} from "@/services/authService";

interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: "guest" | "host";
  location?: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: {
    fullName: string;
    email: string;
    phone: string;
    location?: string;
    website?: string;
    languages?: string;
    bio?: string;
  }) => Promise<ActionResult>;
  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<ActionResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to process the authentication request right now";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  async function refreshUser() {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
    } catch (_error) {
      setUser(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const response = await getCurrentUser();
        if (isMounted) {
          setUser(response.user);
        }
      } catch (_error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await loginRequest({ email, password });
      setUser(response.user);

      return {
        success: true,
        redirectTo: getRedirectPath(response.user.role),
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async function register(payload: RegisterPayload): Promise<RegisterResult> {
    try {
      const response = await registerRequest(payload);
      setUser(response.user);

      return {
        success: true,
        redirectTo: getRedirectPath(response.user.role),
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch (_error) {
      // Allow client-side logout to complete even if the server session has already expired.
    } finally {
      setUser(null);
    }
  }

  async function updateProfile(payload: {
    fullName: string;
    email: string;
    phone: string;
    location?: string;
    website?: string;
    languages?: string;
    bio?: string;
  }): Promise<ActionResult> {
    try {
      const response = await updateProfileRequest(payload);
      setUser(response.user);

      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async function changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ActionResult> {
    try {
      const response = await changePasswordRequest(payload);
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function getUserInitials(name?: string): string {
  if (!name) {
    return "";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((value) => value[0])
    .join("")
    .toUpperCase();
}

export type { AuthUser };
