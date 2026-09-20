import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const code = request.nextUrl.searchParams.get("code");
  const isAdminLogin = request.nextUrl.searchParams.get("admin") === "true";

  if (code) {
    const db = await supabaseServer();
    const { error } = await db.auth.exchangeCodeForSession(code);

    if (!error) {
      const next = safeNext(request.nextUrl.searchParams.get("next"));

      // If this is an admin login attempt, verify admin status
      if (isAdminLogin || next.startsWith("/admin")) {
        const { data: isAdmin, error: adminCheckError } =
          await db.rpc("is_admin");

        if (adminCheckError || !isAdmin) {
          // Sign out and redirect to admin login with error
          await db.auth.signOut();
          return NextResponse.redirect(
            new URL("/admin-login?error=unauthorized", origin),
          );
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const destination =
        process.env.NODE_ENV === "production" && forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;
      return NextResponse.redirect(destination);
    }
  }

  const errorRedirect = isAdminLogin ? "/admin-login" : "/login";
  return NextResponse.redirect(
    new URL(`${errorRedirect}?error=callback`, origin),
  );
}
