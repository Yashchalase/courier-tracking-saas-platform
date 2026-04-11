import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";

export type UserRole =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "DELIVERY_AGENT"
  | "CUSTOMER";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  tenantId?: string;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (token, user) => {
        setAuthCookies(token, user.role);
        set({ token, user });
      },
      logout: () => {
        clearAuthCookies();
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
