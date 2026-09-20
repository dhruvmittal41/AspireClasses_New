import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminForm } from "@/components/admin-form";
import type { Question } from "@/lib/types";
type AdminQuestion = Question & { correct_option: string; test_id: number };
function Fields({ testId, q }: { testId: number; q?: AdminQuestion }) {
  return (
    <>
      <input type="hidden" name="test_id" value={testId} />
      {q && <input type="hidden" name="id" value={q.id} />}
      <label className="span-two">
        Question text
        <textarea
          name="question_text"
          defaultValue={q?.question_text}
          required
          rows={4}
        />
      </label>
      {["a", "b", "c", "d"].map((k) => (
        <label key={k}>
          Option {k.toUpperCase()}
          <textarea name={k} defaultValue={q?.options[k]} required rows={2} />
        </label>
      ))}
      <label>
        Correct option
        <select name="correct_option" defaultValue={q?.correct_option || "a"}>
          {["a", "b", "c", "d"].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label>
        Marks
        <input
          type="number"
          name="marks"
          defaultValue={q?.marks || 1}
          min={1}
          max={100}
          required
        />
      </label>
      <label>
        Image URL (optional; clear to remove)
        <input type="url" name="image_url" defaultValue={q?.image_url || ""} />
      </label>
      <label>
        Or upload an image (max 2 MB)
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
        />
      </label>
    </>
  );
}
export default async function Questions({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const { db } = await requireAdmin();
  const { test } = await searchParams;
  const { data: tests, error } = await db
    .from("tests")
    .select("id,test_name")
    .order("id", { ascending: false });
  if (error) throw error;
  const selected = tests.find((t) => t.id === Number(test)) || tests[0];
  const questions = selected
    ? await db
        .from("questions")
        .select("*")
        .eq("test_id", selected.id)
        .order("id")
    : { data: [], error: null };
  if (questions.error) throw questions.error;
  return (
    <>
      <div className="panel">
        <h2>Choose a test</h2>
        <div className="test-picker">
          {tests.map((t) => (
            <Link
              className={selected?.id === t.id ? "badge" : "text-link"}
              key={t.id}
              href={"/admin/update-questions?test=" + t.id}
            >
              {t.test_name}
            </Link>
          ))}
        </div>
        {!selected && <p>Create a test first.</p>}
      </div>
      {selected && (
        <>
          <section className="panel spaced">
            <h2>Add a question · {selected.test_name}</h2>
            <AdminForm action="save-question" label="Add question">
              <Fields testId={selected.id} />
            </AdminForm>
          </section>
          <h2 className="spaced">Questions ({questions.data?.length})</h2>
          <p className="fine-print">
            Changes apply to new attempts. In-progress attempts retain their
            original questions and scoring.
          </p>
          <div className="admin-list">
            {(questions.data as AdminQuestion[]).map((q, i) => (
              <details key={q.id} className="panel">
                <summary>
                  {i + 1}. {q.question_text.slice(0, 120)}
                </summary>
                <AdminForm action="save-question">
                  <Fields q={q} testId={selected.id} />
                </AdminForm>
                <div className="danger-zone">
                  <AdminForm action="delete-question" label="Remove question">
                    <input type="hidden" name="id" value={q.id} />
                    <label className="checkbox-label">
                      <input type="checkbox" name="confirm" required />I confirm
                      removal of this question.
                    </label>
                  </AdminForm>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </>
  );
}
