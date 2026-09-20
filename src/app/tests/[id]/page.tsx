import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { TestPlayer } from "@/components/test-player";
import { Brand } from "@/components/brand";
import type { Test } from "@/lib/types";
export const metadata = {
  title: "Practice test",
  robots: { index: false, follow: false },
};
export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { db } = await requireUser("/tests/" + id);
  const { data, error } = await db
    .from("tests")
    .select("*")
    .eq("id", Number(id))
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) notFound();
  return (
    <main id="main" className="container section">
      <div className="test-page-header">
        <Brand />
        <Link href="/dashboard/my-tests" className="text-link">
          ← My tests
        </Link>
      </div>
      <TestPlayer test={data as Test} />
    </main>
  );
}

export const dynamic = "force-dynamic";
