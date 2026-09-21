"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not sign out. Please retry.");
  revalidatePath("/", "layout");
  redirect("/");
}
