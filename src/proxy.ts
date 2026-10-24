import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route guard for the authenticated areas (§11.10). Next 16 renamed Middleware to
 * Proxy (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 * The real auth tokens live in sessionStorage (Bearer), which the edge proxy cannot
 * read, so the client auth context also sets a non-HttpOnly presence cookie
 * (`constdoc.customer.authed`). This proxy only checks that flag: if it is absent we
 * redirect to /login before the dashboard/onboarding HTML is served, which stops a
 * logged-out visitor ever seeing those shells. The precise role/account-status/
 * onboarding enforcement — and the "no data flash" — is done client-side by the
 * layout gate (lib/account-gate.ts); this is the optimistic first line only.
 */
const AUTH_COOKIE = "constdoc.customer.authed";

export function proxy(request: NextRequest) {
  const authed = request.cookies.get(AUTH_COOKIE)?.value;
  if (authed) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
