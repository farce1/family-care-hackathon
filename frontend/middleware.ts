import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // For now, we'll use a simple cookie-based check
  // In production, you'd use a proper auth solution
  const isLoggedIn = request.cookies.get("logged-in")?.value === "true"

  // Redirect to login if accessing protected route while not logged in
  if (!isPublicPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to home if accessing login while already logged in
  if (isPublicPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
