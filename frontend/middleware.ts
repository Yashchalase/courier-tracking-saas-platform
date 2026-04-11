import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "auth-token";
const USER_ROLE_COOKIE = "user-role";

const ROLE_DASHBOARD_HOME = {
  SUPER_ADMIN: "/dashboard/admin",
  COMPANY_ADMIN: "/dashboard/company",
  DELIVERY_AGENT: "/dashboard/agent",
  CUSTOMER: "/dashboard/customer",
} as const;

type KnownDashboardRole = keyof typeof ROLE_DASHBOARD_HOME;

function getRoleRequiredForDashboardPath(
  pathname: string
): KnownDashboardRole | null {
  if (pathname.startsWith("/dashboard/admin")) return "SUPER_ADMIN";
  if (pathname.startsWith("/dashboard/company")) return "COMPANY_ADMIN";
  if (pathname.startsWith("/dashboard/agent")) return "DELIVERY_AGENT";
  if (pathname.startsWith("/dashboard/customer")) return "CUSTOMER";
  return null;
}

const isPublicPath = (pathname: string) =>
  pathname === "/" ||
  pathname === "/login" ||
  pathname === "/register" ||
  pathname === "/setup" ||
  pathname === "/offline" ||
  pathname === "/track" ||
  pathname.startsWith("/track/");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(USER_ROLE_COOKIE)?.value;

  if (isPublicPath(pathname)) {
    if (
      token &&
      role &&
      role in ROLE_DASHBOARD_HOME &&
      (pathname === "/login" || pathname === "/register" || pathname === "/setup")
    ) {
      return NextResponse.redirect(
        new URL(
          ROLE_DASHBOARD_HOME[role as KnownDashboardRole],
          request.url
        )
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token || !role || !(role in ROLE_DASHBOARD_HOME)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const home = ROLE_DASHBOARD_HOME[role as KnownDashboardRole];

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(home, request.url));
    }

    const required = getRoleRequiredForDashboardPath(pathname);
    if (!required) {
      return NextResponse.redirect(new URL(home, request.url));
    }

    if (role !== required) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|workbox.*|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
