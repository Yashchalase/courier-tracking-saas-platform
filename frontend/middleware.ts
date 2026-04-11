import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_TOKEN_COOKIE, USER_ROLE_COOKIE } from "@/lib/constants";
import {
  ROLE_DASHBOARD_HOME,
  getRoleRequiredForDashboardPath,
  type KnownDashboardRole,
} from "@/lib/role-routing";

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
