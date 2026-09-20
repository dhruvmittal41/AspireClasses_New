import { requireAdmin } from "@/lib/admin-auth";
import { AdminForm } from "@/components/admin-form";
import type { Test, Exam } from "@/lib/types";
function Fields({ test, exams }: { test?: Test; exams: Exam[] }) {
  return (
    <>
      {test && <input type="hidden" name="id" value={test.id} />}
      <label>
        Test title
        <input
          name="test_name"
          defaultValue={test?.test_name}
          required
          maxLength={200}
        />
      </label>
      <label>
        Exam
        <select name="exam_id" defaultValue={test?.exam_id}>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Duration in minutes
        <input
          name="duration_minutes"
          type="number"
          defaultValue={test?.duration_minutes || 60}
          min={1}
          max={360}
          required
        />
      </label>
      <label>
        Type
        <select
          name="test_category"
          defaultValue={test?.test_category || "standard"}
        >
          <option value="standard">Assigned test</option>
          <option value="demo">Free demo</option>
          <option value="upcoming">Coming soon (not open)</option>
        </select>
      </label>
      <label>
        Subject or topic
        <input name="subject_topic" defaultValue={test?.subject_topic} />
      </label>
      <label>
        Opens at (India Standard Time)
        <input
          name="date_scheduled"
          type="datetime-local"
          defaultValue={
            test?.date_scheduled
              ? new Date(Date.parse(test.date_scheduled) + 19800000)
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
        />
      </label>
      <label className="span-two">
        Instructions
        <textarea
          name="instructions"
          rows={4}
          defaultValue={test?.instructions}
        />
      </label>
      <label className="checkbox-label">
        <input
          name="published"
          type="checkbox"
          defaultChecked={test?.published}
          disabled={!test}
        />
        Published (add questions first)
      </label>
    </>
  );
}
export default async function Tests() {
  const { db } = await requireAdmin();
  const [tests, exams] = await Promise.all([
    db.from("tests").select("*").order("id", { ascending: false }),
    db.from("exams").select("*").order("sort_order"),
  ]);
  if (tests.error || exams.error) throw new Error("Could not load tests");
  return (
    <>
      <section className="panel">
        <h2>Create a new test</h2>
        <AdminForm action="save-test" label="Create draft">
          <Fields exams={exams.data as Exam[]} />
        </AdminForm>
      </section>
      <h2 className="spaced">Manage existing tests</h2>
      <div className="admin-list">
        {(tests.data as Test[]).map((t) => (
          <details className="panel" key={t.id}>
            <summary>
              #{t.id} · {t.test_name}{" "}
              <span className="badge">
                {t.published ? "Published" : "Draft"}
              </span>
            </summary>
            <AdminForm action="save-test">
              <Fields test={t} exams={exams.data as Exam[]} />
            </AdminForm>
          </details>
        ))}
      </div>
    </>
  );
}
