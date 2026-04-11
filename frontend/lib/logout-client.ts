import { useAuthStore } from "@/store/auth";

/**
 * Clears auth (cookies + persisted store) and loads /login in one full navigation.
 * Avoids slow client-side transitions and keeps middleware cookies in sync.
 */
export function logoutAndGoToLogin(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
  window.location.assign("/login");
}
