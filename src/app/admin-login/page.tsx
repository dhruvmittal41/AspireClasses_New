import { Metadata } from "next";
import { AdminAuthForm } from "@/components/admin-auth-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Administrator access only",
};

export default function AdminLoginPage() {
  return <AdminAuthForm />;
}
