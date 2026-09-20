"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

export async function reviewPasswordRequest(_previous: { message: string }, form: FormData) {
  const { db, user } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { message: "Invalid request." };
  const reject = form.get("action") === "reject";
  if (!reject) {
    if (form.get("verified") !== "on") return { message: "Verify the student through your existing records or a known contact first." };
    const password = z.string().min(12).max(72).safeParse(form.get("password"));
    if (!password.success) return { message: "Use a replacement password of 12–72 characters." };
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!key || !url) return { message: "The site owner must configure the server-only Supabase service role key to enable manual resets." };
    const { data: target, error } = await db.rpc("password_help_account", { p_request_id: id.data });
    if (error || !target) return { message: "No eligible student account found. Admin accounts require recovery by the project owner." };
    const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: resetError } = await service.auth.admin.updateUserById(target, { password: password.data, email_confirm: true });
    if (resetError) return { message: "Password update failed. The request remains pending." };
  }
  const { error, data } = await db.from("password_help_requests")
    .update({ status: reject ? "rejected" : "resolved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id.data).eq("status", "pending").select("id");
  revalidatePath("/admin/password-requests");
  if (error || !data?.length) return { message: reject ? "Could not close the request." : "Password changed, but the request status could not be saved. Do not repeat the reset; refresh and check the request." };
  return { message: reject ? "Request rejected." : "Password changed. Share it privately with the verified student or parent." };
}
