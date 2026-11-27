import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/server-auth";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasToken = request.cookies.has(AUTH_COOKIE_NAME);

  if (pathname.startsWith("/dashboard") && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasToken && !searchParams.has("expired")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
