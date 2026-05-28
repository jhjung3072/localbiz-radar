"use client";

import { create } from "zustand";
import type { AdminUser } from "@/features/auth/types";

type AuthState = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
  setChecking: (isChecking: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: false,
  setUser: (user) => set({ user, isAuthenticated: true, isChecking: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isChecking: false }),
  setChecking: (isChecking) => set({ isChecking }),
}));
