/** Cookie names readable by middleware (Edge) and client auth sync */
export const AUTH_TOKEN_COOKIE = "auth-token";
export const USER_ROLE_COOKIE = "user-role";

/** Max age for auth cookies (seconds) — align with typical JWT/session lifetime */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
