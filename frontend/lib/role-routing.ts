/**
 * Single source of truth for role → default dashboard path.
 * Used by middleware, login redirect, and client role guards.
 */
export const ROLE_DASHBOARD_HOME = {
  SUPER_ADMIN: "/dashboard/admin",
  COMPANY_ADMIN: "/dashboard/company",
  DELIVERY_AGENT: "/dashboard/agent",
  CUSTOMER: "/dashboard/customer",
} as const;

export type KnownDashboardRole = keyof typeof ROLE_DASHBOARD_HOME;

export function getDashboardHomeForRole(
  role: string | undefined | null
): string {
  if (!role || !(role in ROLE_DASHBOARD_HOME)) return "/login";
  return ROLE_DASHBOARD_HOME[role as KnownDashboardRole];
}

/** Role required to access this pathname under /dashboard (prefix match). */
export function getRoleRequiredForDashboardPath(
  pathname: string
): KnownDashboardRole | null {
  if (pathname.startsWith("/dashboard/admin")) return "SUPER_ADMIN";
  if (pathname.startsWith("/dashboard/company")) return "COMPANY_ADMIN";
  if (pathname.startsWith("/dashboard/agent")) return "DELIVERY_AGENT";
  if (pathname.startsWith("/dashboard/customer")) return "CUSTOMER";
  return null;
}
