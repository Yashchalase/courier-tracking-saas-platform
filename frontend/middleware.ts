import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token =
    request.cookies.get("auth-token")?.value ?? "";
  const role =
    request.cookies.get("user-role")?.value ?? "";

  let home: string | null = null;
  switch (role) {
    case "SUPER_ADMIN":
      home = "/dashboard/admin";
      break;
    case "COMPANY_ADMIN":
      home = "/dashboard/company";
      break;
    case "DELIVERY_AGENT":
      home = "/dashboard/agent";
      break;
    case "CUSTOMER":
      home = "/dashboard/customer";
      break;
    default:
      home = null;
  }

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/setup" ||
    pathname === "/offline" ||
    pathname === "/track" ||
    pathname.startsWith("/track/");

  if (isPublic) {
    const authLanding =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/setup";
    if (token && home && authLanding) {
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token || !home) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(home, request.url));
    }

    let required: string | null = null;
    if (pathname.startsWith("/dashboard/admin")) {
      required = "SUPER_ADMIN";
    } else if (pathname.startsWith("/dashboard/company")) {
      required = "COMPANY_ADMIN";
    } else if (pathname.startsWith("/dashboard/agent")) {
      required = "DELIVERY_AGENT";
    } else if (pathname.startsWith("/dashboard/customer")) {
      required = "CUSTOMER";
    }

    if (!required || role !== required) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|ico|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
