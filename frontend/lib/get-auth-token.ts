const AUTH_STORAGE_KEY = "auth-storage";

/** Reads JWT from Zustand persist payload in localStorage (works before rehydration). */
export function getAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { token?: string | null };
    };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}
