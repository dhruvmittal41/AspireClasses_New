import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { currentUser } from "@/lib/auth";
import { safeNext } from "@/lib/site";
import { redirect } from "next/navigation";
export const metadata = { title: "Log in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await currentUser();
  if (user) {
    const next = safeNext((await searchParams).next ?? null);
    redirect(["/login", "/register"].includes(next.split("?")[0].split("#")[0]) ? "/dashboard" : next);
  }
  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <AuthForm />
    </Suspense>
  );
}
