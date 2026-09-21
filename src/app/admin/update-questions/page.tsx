import Form from "next/form";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminForm } from "@/components/admin-form";
import type { Question } from "@/lib/types";
import { AdminPagination, ADMIN_PAGE_SIZE, adminPage, searchPattern } from "@/components/admin-pagination";
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
  searchParams: Promise<{ test?: string; page?: string; q?: string }>;
}) {
  const { db } = await requireAdmin();
  const { test, page: pageValue, q: search } = await searchParams;
  const page = adminPage(pageValue);
  const q = (search || "").trim().slice(0, 100);
  const { data: tests, error } = await db
    .from("tests")
    .select("id,test_name")
    .order("id", { ascending: false });
  if (error) throw error;
  const selected = test ? tests.find((t) => t.id === Number(test)) : tests[0];
  const questions = selected
    ? await db
        .from("questions")
        .select("*", { count: "exact" })
        .eq("test_id", selected.id)
        .ilike("question_text", searchPattern(q))
        .order("id")
        .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1)
    : { data: [], error: null, count: 0 };
  if (questions.error) throw questions.error;
  return (
    <>
      <div className="panel">
        <h2>Choose a test</h2>
        <Form className="admin-filters" action="/admin/update-questions"><label>Test<select name="test" defaultValue={selected?.id} required>{tests.map(t => <option value={t.id} key={t.id}>#{t.id} · {t.test_name}</option>)}</select></label><button className="button secondary">Open questions</button></Form>
        {!selected && <p>{test ? "This test is unavailable. Choose another test." : "Create a test first."} <Link href="/admin/create-test">Go to tests →</Link></p>}
      </div>
      {selected && (
        <>
          <details className="panel spaced admin-create" open key={selected.id}>
            <summary>Add a question · {selected.test_name}</summary>
            <AdminForm action="save-question" label="Add question" resetOnSuccess>
              <Fields testId={selected.id} />
            </AdminForm>
          </details>
          <h2 className="spaced">Question bank</h2>
          <p className="fine-print">
            Changes apply to new attempts. In-progress attempts retain their
            original questions and scoring.
          </p>
          <Form action="/admin/update-questions" className="admin-filters"><input type="hidden" name="test" value={selected.id} /><label>Search questions<input type="search" name="q" defaultValue={q} placeholder="Question text…" /></label><button className="button secondary">Search</button>{q && <Link href={"/admin/update-questions?test=" + selected.id} className="text-link">Clear</Link>}</Form>
          {!questions.data?.length && <p className="workspace-empty panel">{q ? "No matching questions. Try another search." : "No questions yet. Add the first question above."}</p>}
          <div className="admin-list">
            {(questions.data as AdminQuestion[]).map((q, i) => (
              <details key={q.id} className="panel">
                <summary>
                  {(page - 1) * ADMIN_PAGE_SIZE + i + 1}. {q.question_text.slice(0, 120)} <span className="badge">{q.marks} marks</span>
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
          <AdminPagination path="/admin/update-questions" page={page} count={questions.count || 0} params={{ test: String(selected.id), q }} />
        </>
      )}
    </>
  );
}
