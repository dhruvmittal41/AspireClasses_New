"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function verifyAdminEmail(email: string, password: string) {
  if (typeof email !== "string" || email.length > 254)
    return { error: "Enter a valid email address." };
  const trimmedEmail = email.trim().toLowerCase();
  if (typeof password !== "string" || !password || password.length > 72)
    return { error: "Enter your admin password." };

  // Check if email is in admin allowlist
  const db = await supabaseServer();
  const { error: loginError } = await db.auth.signInWithPassword({ email: trimmedEmail, password });
  if (loginError && (loginError.code === "email_provider_disabled" || loginError.message.toLowerCase().includes("email logins are disabled")))
    return { error: "Email/password login is disabled in Supabase. The site owner must enable the Email provider and leave Confirm email OFF." };
  if (loginError)
    return { error: loginError.code === "email_not_confirmed"
      ? "This account needs activation. Ask the site owner to activate your admin account in Supabase."
      : "Unable to sign in. Check your email and password." };
  const { data: session, error: sessionError } = await db.auth.getUser();
  if (sessionError || !session.user) return { error: "Sign-in failed. Please try again." };
  if (session.user.email?.trim().toLowerCase() !== trimmedEmail)
    return { error: "Use the email of your signed-in account, or sign in with your admin account first." };
  const { data: allowlistCheck, error } = await db.rpc("is_admin");

  if (error) {
    return { error: "Unable to verify admin access. Please try again." };
  }

  if (allowlistCheck !== true) {
    return {
      error:
        "This email is not authorized for admin access. Contact an administrator if you believe this is an error.",
    };
  }

  return { next: "/admin" };
}
