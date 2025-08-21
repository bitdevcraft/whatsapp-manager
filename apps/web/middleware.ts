import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;

  // Allow framework/data routes and server actions untouched
  if (
    p.startsWith("/_next") ||
    p.startsWith("/api/auth") ||
    request.headers.has("next-action") // Server Action POSTs
  ) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);

  headers.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[^/]+$).*)",
  ],
};
