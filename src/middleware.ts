import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    (token && url.pathname.startsWith("/sign-in"))
  ) {
    // If the user is authenticated and trying to access the sign-in page, redirect to the home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed if authenticated or on the login page
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/", "/login", "/signup"],
};
