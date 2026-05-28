import { apiClient } from "@/lib/api-client";
import type {
  AdminUser,
  AuthResponse,
  LoginPayload,
  LogoutResponse,
} from "@/features/auth/types";

export function login(payload: LoginPayload) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    skipAuthRefresh: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function refresh() {
  return apiClient<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export function getMe() {
  return apiClient<AdminUser>("/api/auth/me");
}

export function logout() {
  return apiClient<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
  });
}
