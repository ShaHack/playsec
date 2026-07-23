import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const VALID_EXACT_ROUTES = new Set([
  "/",
  "/playbooks",
  "/knowledge",
  "/library/offensive",
  "/library/defensive",
  "/community",
  "/contact",
  "/about",
  "/privacy",
  "/docs",
  "/api/contact",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow internal Next.js assets, static files, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check valid exact routes
  if (VALID_EXACT_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Check valid dynamic playbook slug route: /playbooks/[slug]
  if (pathname.startsWith("/playbooks/")) {
    const subPath = pathname.slice("/playbooks/".length);
    // Ensure slug is non-empty and has no further nested paths
    if (subPath && !subPath.includes("/")) {
      return NextResponse.next();
    }
  }

  // Redirect any invalid route, /admin, /dashboard, or non-existent path to "/"
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
