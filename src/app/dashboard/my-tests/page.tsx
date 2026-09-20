import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TestCard } from "@/components/test-card";
import type { Test } from "@/lib/types";
export const metadata = { title: "My tests" };
export default async function MyTests() {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("enrollments")
    .select("tests(*)")
    .eq("user_id", user.id);
  if (error) throw error;
  const tests = (data || []).flatMap((r) =>
    r.tests ? [r.tests as unknown as Test] : [],
  );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR NEXT STEP</span>
        <h1>Make practice a habit.</h1>
        <p>Your assigned tests, ready when you are.</p>
      </div>
      {tests.length ? (
        <div className="three-grid">
          {tests.map((t) => (
            <TestCard key={t.id} test={t} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>A fresh page for your progress.</h2>
          <p>
            No tests have been assigned yet. Explore a series or try a free
            demo.
          </p>
          <Link href="/exams" className="button">
            Find your test series →
          </Link>
        </div>
      )}
    </>
  );
}
