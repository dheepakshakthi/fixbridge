import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);
  const { pathname } = request.nextUrl;

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Helper: decode role from JWT or fallback to user_metadata
  const getRole = (user: any): string | null => {
    try {
      // 1. Try to get from JWT claim (most secure, used for RLS)
      let token: string | undefined;
      for (const [name, { value }] of request.cookies) {
        if (name.endsWith("-auth-token")) {
          token = value;
          break;
        }
      }

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.user_role) return payload.user_role;
      }

      // 2. Fallback to user_metadata (useful immediately after signup)
      return user?.user_metadata?.user_role ?? null;
    } catch {
      return user?.user_metadata?.user_role ?? null;
    }
  };

  const userRole = getRole(user);

  // Unauthenticated user tries to access protected routes
  if (!user) {
    if (
      pathname.startsWith("/customer") ||
      pathname.startsWith("/provider") ||
      pathname.startsWith("/admin")
    ) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // Authenticated user — check role-based route guards
  if (
    pathname.startsWith("/provider") &&
    userRole !== "provider" &&
    userRole !== "admin" &&
    userRole !== "super_admin"
  ) {
    return NextResponse.redirect(new URL("/unauthorised", request.url));
  }

  if (
    pathname.startsWith("/admin") &&
    userRole !== "admin" &&
    userRole !== "super_admin"
  ) {
    return NextResponse.redirect(new URL("/unauthorised", request.url));
  }

  // Redirect authenticated users away from login/register
  if (pathname === "/login" || pathname === "/register") {
    if (userRole === "provider")
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    if (userRole === "admin" || userRole === "super_admin")
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.redirect(new URL("/customer/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
