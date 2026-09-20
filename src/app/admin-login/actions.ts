"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function verifyAdminEmail(email: string) {
  const trimmedEmail = email.trim().toLowerCase();

  // Check if email is in admin allowlist
  const db = await supabaseServer();
  const { data: allowlistCheck, error } = await db
    .from("admin_allowlist")
    .select("enabled")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (error) {
    return { error: "Unable to verify admin access. Please try again." };
  }

  if (!allowlistCheck || !allowlistCheck.enabled) {
    return {
      error:
        "This email is not authorized for admin access. Contact an administrator if you believe this is an error.",
    };
  }

  // Set cookie and redirect
  const cookieStore = await cookies();
  cookieStore.set("admin_email", trimmedEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/admin");
}
