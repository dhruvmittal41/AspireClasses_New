import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site";
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const db = await supabaseServer();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = safeNext(request.nextUrl.searchParams.get("next"));
      const forwardedHost = request.headers.get("x-forwarded-host");
      const destination =
        process.env.NODE_ENV === "production" && forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;
      return NextResponse.redirect(destination);
    }
  }
  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
