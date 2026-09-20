import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export const metadata = { title: "Create your account" };
export default async function Register() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <Suspense fallback={<p>Loading registration…</p>}>
      <AuthForm register />
    </Suspense>
  );
}
