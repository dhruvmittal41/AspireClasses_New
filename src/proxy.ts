import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, credentials } from "@/lib/supabase/config";
import { authCookieOptions } from "@/lib/supabase/cookie-options";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isConfigured()) return response;
  const { url, key } = credentials();
  const supabase = createServerClient(url, key, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/tests/:path*",
    "/api/:path*",
    "/auth/:path*",
    "/login",
    "/admin-login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/payment/:path*",
  ],
};
