import { Suspense } from "react";
import { Metadata } from "next";
import { AdminAuthForm } from "@/components/admin-auth-form";
import { currentUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Administrator access only",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await currentUser()) {
    const db = await supabaseServer();
    const { data: allowed, error } = await db.rpc("is_admin");
    if (error) throw new Error("Admin access could not be checked. Please retry.");
    if (allowed === true) redirect("/admin");
  }
  return (
    <Suspense fallback={<p>Loading admin login…</p>}>
      <AdminAuthForm />
    </Suspense>
  );
}
