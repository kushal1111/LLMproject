import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Allow OAuth callback URLs and error pages to pass through
  if (url.pathname.startsWith("/api/auth") || url.pathname.includes("error=")) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access login/signup pages, redirect to chat
  if (token && (url.pathname === "/login" || url.pathname === "/signup" || url.pathname === "/sign-in" || url.pathname === "/")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!token && (url.pathname.startsWith("/chat") || url.pathname === "/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/sign-in", "/chat", "/api/auth/:path*"],
};
