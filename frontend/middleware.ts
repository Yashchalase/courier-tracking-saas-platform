import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Diagnostic: matcher only hits a path no real user requests, so `/`, `/login`,
 * `/dashboard/*`, etc. skip Edge middleware entirely. If Vercel 500 disappears,
 * the failure was in the middleware pipeline. Restore from `middleware.backup.ts`.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/__middleware_disabled__/no-op"],
};
