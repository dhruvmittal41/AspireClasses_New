import { Suspense } from "react";
import { Metadata } from "next";
import { AdminAuthForm } from "@/components/admin-auth-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Administrator access only",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p>Loading admin login…</p>}>
      <AdminAuthForm />
    </Suspense>
  );
}
