import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";
import { isConfigured } from "./supabase/config";
import type { Profile } from "./types";
export const currentUser = cache(async () => {
  if (!isConfigured()) return null;
  const db = await supabaseServer();
  const { data, error } = await db.auth.getUser();
  if (error && (error.status === 0 || (error.status ?? 0) >= 500 || error.name === "AuthRetryableFetchError"))
    throw new Error("Sign-in service is temporarily unavailable. Please retry; your session has not been cleared.");
  return error ? null : data.user;
});
export const requireUser = cache(async (returnTo = "/dashboard") => {
  const loginUrl = "/login?next=" + encodeURIComponent(returnTo);
  if (!isConfigured()) redirect(loginUrl);
  const db = await supabaseServer();
  const user = await currentUser();
  if (!user) redirect(loginUrl);
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError)
    throw new Error(
      "Your profile could not be loaded. Please contact support.",
    );
  return { db, user, profile: profile as Profile };
});
export const requireAdmin = cache(async () => {
  const loginUrl = "/admin-login";
  if (!isConfigured()) redirect(loginUrl);

  const db = await supabaseServer();
  const user = await currentUser();
  if (!user) redirect(loginUrl);

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(
      "Your profile could not be loaded. Please contact support.",
    );
  }

  // The database checks the verified user's email against the allowlist.
  const { data: isAdmin, error: adminCheckError } = await db.rpc("is_admin");

  if (adminCheckError) throw new Error("Admin access could not be checked. Please retry.");
  if (!isAdmin) {
    redirect(`${loginUrl}?error=unauthorized`);
  }

  return { db, user, profile: profile as Profile };
});
