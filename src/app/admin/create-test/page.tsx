import Form from "next/form";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminForm } from "@/components/admin-form";
import type { Test, Exam } from "@/lib/types";
import Link from "next/link";
import { AdminPagination, ADMIN_PAGE_SIZE, adminPage, searchPattern } from "@/components/admin-pagination";
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
export default async function Tests({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { db } = await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 100);
  const page = adminPage(params.page);
  const status = ["draft", "published"].includes(params.status || "") ? params.status! : "all";
  let query = db.from("tests").select("*", { count: "exact" }).order("id", { ascending: false });
  if (q) query = query.ilike("test_name", searchPattern(q));
  if (status !== "all") query = query.eq("published", status === "published");
  const [tests, exams] = await Promise.all([
    query.range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1),
    db.from("exams").select("*").order("sort_order"),
  ]);
  if (tests.error || exams.error) throw new Error("Could not load tests");
  return (
    <>
      <div className="workspace-intro"><div><h2>Your test library</h2><p>Create a draft, add questions, then publish when it’s ready.</p></div></div>
      <details className="panel admin-create" id="new-test">
        <summary>Create a new test <span className="badge">Draft</span></summary>
        <AdminForm action="save-test" label="Create draft" resetOnSuccess>
          <Fields exams={exams.data as Exam[]} />
        </AdminForm>
      </details>
      <Form className="admin-filters" action="/admin/create-test">
        <label>Search tests<input name="q" type="search" placeholder="Test title…" defaultValue={q} /></label>
        <label>Status<select name="status" defaultValue={status}><option value="all">All tests</option><option value="draft">Drafts</option><option value="published">Published</option></select></label>
        <button className="button secondary">Apply filters</button>
        {(q || status !== "all") && <Link href="/admin/create-test" className="text-link">Clear</Link>}
      </Form>
      {!tests.data.length && <div className="panel workspace-empty"><h3>No tests found</h3><p>Create your first draft or adjust your filters.</p></div>}
      <div className="admin-list">
        {(tests.data as Test[]).map((t) => (
          <details className="panel" key={t.id}>
            <summary>
              #{t.id} · {t.test_name}{" "}
              <span className="badge">
                {t.published ? "Published" : "Draft"}
              </span>
            </summary>
            <div className="record-meta"><span>{t.duration_minutes} min · {t.test_category === "demo" ? "Free demo" : "Assigned test"}</span><Link className="button secondary small" href={"/admin/update-questions?test=" + t.id}>Manage questions →</Link></div>
            <AdminForm action="save-test">
              <Fields test={t} exams={exams.data as Exam[]} />
            </AdminForm>
          </details>
        ))}
      </div>
      <AdminPagination path="/admin/create-test" page={page} count={tests.count || 0} params={{ q, status }} />
    </>
  );
}
