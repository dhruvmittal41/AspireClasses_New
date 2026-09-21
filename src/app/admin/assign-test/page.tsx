import Form from "next/form";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminForm } from "@/components/admin-form";
import { AdminPagination, ADMIN_PAGE_SIZE, adminPage, searchPattern } from "@/components/admin-pagination";

export default async function Assign({ searchParams }: { searchParams: Promise<{ q?: string; student?: string; page?: string }> }) {
  const { db } = await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 100);
  const student = /^[0-9a-f-]{36}$/i.test(params.student || "") ? params.student! : "";
  const page = adminPage(params.page);
  let studentQuery = db.from("profiles").select("id,full_name,school_name", { count: "exact" }).order("full_name").order("id");
  if (student) studentQuery = studentQuery.eq("id", student);
  else if (q) studentQuery = studentQuery.ilike("full_name", searchPattern(q));
  let accessQuery = db.from("enrollments").select("user_id,test_id,profiles(full_name,school_name),tests(test_name)", { count: "exact" }).order("created_at", { ascending: false }).order("user_id").order("test_id");
  if (student) accessQuery = accessQuery.eq("user_id", student);
  const [profiles, tests, bundles, enrollments] = await Promise.all([
    studentQuery.limit(50),
    db.from("tests").select("id,test_name,published").order("id", { ascending: false }),
    db.from("bundles").select("id,bundle_name").order("id", { ascending: false }),
    accessQuery.range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1),
  ]);
  if (profiles.error || tests.error || bundles.error || enrollments.error) throw new Error("Could not load assignments");
  const studentSelect = <label>Student<select name="user_id" required defaultValue={student}>
    <option value="" disabled>Choose a student</option>
    {profiles.data.map(p => <option key={p.id} value={p.id}>{p.full_name || "Unnamed"} · {p.school_name || "No school"} · {p.id.slice(0, 8)}</option>)}
  </select></label>;
  const relation = <T,>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] || null : value;
  return <>
    <div className="workspace-intro"><div><h2>Give students the right access</h2><p>Find a student, verify their school and ID, then assign a test or bundle.</p></div></div>
    <Form className="admin-filters" action="/admin/assign-test"><label>Find students by name<input type="search" name="q" defaultValue={q} placeholder="Student name…" /></label><button className="button secondary">Find students</button>{(q || student) && <Link href="/admin/assign-test" className="text-link">Clear</Link>}</Form>
    {(profiles.count || 0) > 50 && <p className="notice">Showing 50 matching students. Narrow your search to find the right person.</p>}
    {!profiles.data.length && <p className="notice">No students found. Adjust your search or ask the student to create an account.</p>}
    <div className="two-grid assignment-forms">
      <section className="panel"><h2>Assign a test</h2><p className="fine-print">Grant access to one practice test.</p><AdminForm action="assign-test" label="Grant test access" key={"test-" + q + student}>
        {studentSelect}<label>Test<select name="test_id" required defaultValue=""><option value="" disabled>Choose a test</option>{tests.data.map(t => <option key={t.id} value={t.id}>{t.test_name}{t.published ? "" : " (draft)"}</option>)}</select></label>
      </AdminForm></section>
      <section className="panel"><h2>Assign a bundle</h2><p className="fine-print">Grant access to all tests currently in the bundle.</p><AdminForm action="assign-bundle" label="Grant bundle access" key={"bundle-" + q + student}>
        {studentSelect}<label>Bundle<select name="bundle_id" required defaultValue=""><option value="" disabled>Choose a bundle</option>{bundles.data.map(b => <option key={b.id} value={b.id}>{b.bundle_name}</option>)}</select></label>
      </AdminForm></section>
    </div>
    <div className="workspace-intro spaced"><div><h2>Current assignments</h2><p>{student ? "Access for the selected student." : "Latest access grants across all students."}</p></div>{student && <Link href="/admin/assign-test" className="text-link">View all</Link>}</div>
    {!enrollments.data.length && <p className="panel workspace-empty">No assignments yet. Granted tests will appear here.</p>}
    <div className="admin-list">{enrollments.data.map(e => {
      const profile = relation(e.profiles);
      const test = relation(e.tests);
      return <details className="panel" key={e.user_id + e.test_id}><summary>{profile?.full_name || "Student"} <span className="record-secondary">{test?.test_name || "Test #" + e.test_id}</span></summary>
        <div className="record-meta"><span>{profile?.school_name || "No school provided"} · ID {e.user_id.slice(0, 8)}</span><Link href={"/admin/assign-test?student=" + e.user_id} className="text-link">View this student’s access</Link></div>
        <AdminForm action="revoke-test" label="Revoke access"><input name="user_id" type="hidden" value={e.user_id} /><input name="test_id" type="hidden" value={e.test_id} /><label className="checkbox-label"><input type="checkbox" name="confirm" required />Confirm removal of this test’s access</label></AdminForm>
      </details>;
    })}</div>
    <AdminPagination path="/admin/assign-test" page={page} count={enrollments.count || 0} params={{ q, student }} />
  </>;
}
