import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow framework/data routes and server actions untouched.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    request.headers.has("next-action")
  ) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[^/]+$).*)",
  ],
};
