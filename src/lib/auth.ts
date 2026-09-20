import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";
import { isConfigured } from "./supabase/config";
import type { Profile } from "./types";
export async function requireUser(returnTo = "/dashboard") {
  const loginUrl = "/login?next=" + encodeURIComponent(returnTo);
  if (!isConfigured()) redirect(loginUrl);
  const db = await supabaseServer();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect(loginUrl);
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();
  if (profileError)
    throw new Error(
      "Your profile could not be loaded. Please contact support.",
    );
  return { db, user: data.user, profile: profile as Profile };
}
export async function requireAdmin() {
  const loginUrl = "/admin-login";
  if (!isConfigured()) redirect(loginUrl);

  const db = await supabaseServer();
  const { data, error } = await db.auth.getUser();

  if (error || !data.user) redirect(loginUrl);

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    throw new Error(
      "Your profile could not be loaded. Please contact support.",
    );
  }

  // The database checks the verified user's email against the allowlist.
  const { data: isAdmin, error: adminCheckError } = await db.rpc("is_admin");

  if (adminCheckError || !isAdmin) {
    redirect(`${loginUrl}?error=unauthorized`);
  }

  return { db, user: data.user, profile: profile as Profile };
}
