import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_TOKEN_COOKIE,
  USER_ROLE_COOKIE,
} from "@/lib/constants";

/**
 * Sets cookies readable by middleware. Zustand persist uses localStorage;
 * middleware cannot read localStorage, so we mirror auth into cookies here.
 */
export function setAuthCookies(token: string, role: string) {
  if (typeof document === "undefined") return;
  const opts = `path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; ${opts}`;
  document.cookie = `${USER_ROLE_COOKIE}=${encodeURIComponent(role)}; ${opts}`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  // Match setAuthCookies so browsers reliably expire the cookie
  const opts = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `${AUTH_TOKEN_COOKIE}=; ${opts}`;
  document.cookie = `${USER_ROLE_COOKIE}=; ${opts}`;
}
