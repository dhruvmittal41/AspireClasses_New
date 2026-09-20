import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";
import { isConfigured } from "./supabase/config";

const ADMIN_EMAIL_COOKIE = "admin_email";

export async function requireAdmin() {
  const loginUrl = "/admin-login";
  
  if (!isConfigured()) {
    redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const adminEmail = cookieStore.get(ADMIN_EMAIL_COOKIE)?.value;

  if (!adminEmail) {
    redirect(`${loginUrl}?error=unauthorized`);
  }

  // Verify the email is still in the admin allowlist
  const db = await supabaseServer();
  const { data: allowlistCheck } = await db
    .from("admin_allowlist")
    .select("enabled")
    .eq("email", adminEmail.toLowerCase().trim())
    .maybeSingle();

  if (!allowlistCheck || !allowlistCheck.enabled) {
    // Email no longer authorized - clear cookie and redirect
    cookieStore.delete(ADMIN_EMAIL_COOKIE);
    redirect(`${loginUrl}?error=unauthorized`);
  }

  return { db, adminEmail };
}
