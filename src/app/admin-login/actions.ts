"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function verifyAdminEmail(email: string) {
  if (typeof email !== "string" || email.length > 254)
    return { error: "Enter a valid email address." };
  const trimmedEmail = email.trim().toLowerCase();

  // Check if email is in admin allowlist
  const db = await supabaseServer();
  const { data: session, error: sessionError } = await db.auth.getUser();
  if (sessionError || !session.user)
    return { next: "/login?next=%2Fadmin" };
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
