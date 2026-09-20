import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
export default async function Admin() {
  const { db } = await requireAdmin();
  const responses = await Promise.all(
    ["profiles", "tests", "questions", "results"].map((t) =>
      db.from(t).select("*", { count: "exact", head: true }),
    ),
  );
  if (responses.some((r) => r.error))
    throw new Error("Could not load admin overview");
  return (
    <>
      <div className="stats-grid">
        {responses.map((r, i) => (
          <div key={i} className="stat-card">
            <strong>{r.count || 0}</strong>
            <span>
              {
                [
                  "Students and admins",
                  "Tests",
                  "Questions",
                  "Completed attempts",
                ][i]
              }
            </span>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>From an idea to a published test.</h2>
        <ol className="feature-list">
          <li>Add or choose an exam collection.</li>
          <li>Create a test as a draft and add its questions.</li>
          <li>
            Review the questions, duration, and availability, then publish the
            test.
          </li>
          <li>
            Assign standard tests to students. Published demo tests are
            available to all students.
          </li>
        </ol>
        <Link href="/admin/create-test" className="button">
          Create a test →
        </Link>
      </div>
    </>
  );
}
