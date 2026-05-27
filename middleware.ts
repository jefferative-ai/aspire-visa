import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const accessCode = process.env.ACCESS_CODE?.trim();

export function middleware(request: NextRequest) {
  if (!accessCode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    pathname === "/access-code" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get("access_code_granted")?.value;
  if (accessCookie === "1") {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/access-code";
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|access-code|favicon\.ico|robots\.txt).*)"],
};
