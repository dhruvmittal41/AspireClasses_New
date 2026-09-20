import { requireUser } from "@/lib/auth";
import type { Result } from "@/lib/types";
export const metadata = { title: "My results" };
export default async function Results() {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("results")
    .select("*,tests(test_name)")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  const rows = data as unknown as Result[];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">EFFORT BECOMES INSIGHT</span>
        <h1>Your progress, in perspective.</h1>
        <p>Every attempt tells you something. Use it to plan your next step.</p>
      </div>
      {rows.length ? (
        <div className="results-list">
          {rows.map((r) => {
            const percent = r.total_marks
              ? Math.round((r.score / r.total_marks) * 100)
              : 0;
            return (
              <article id={r.id} className="panel result-row" key={r.id}>
                <div>
                  <span className="eyebrow">
                    {new Date(r.submitted_at).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                  <h2>{r.tests?.test_name || "Practice test"}</h2>
                  <p>
                    {r.correct_count} correct out of {r.question_count}{" "}
                    questions
                  </p>
                </div>
                <div className="result-score">
                  <strong>
                    {r.score}
                    <small> / {r.total_marks}</small>
                  </strong>
                  <meter
                    min={0}
                    max={100}
                    value={percent}
                    aria-label={`${percent}% score`}
                  />
                  <span>{percent}% score</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>This is where progress takes shape.</h2>
          <p>Complete a test to see your score and track your attempts.</p>
        </div>
      )}
    </>
  );
}
