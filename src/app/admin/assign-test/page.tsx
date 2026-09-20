import { requireAdmin } from "@/lib/auth";
import { AdminForm } from "@/components/admin-form";
export default async function Assign() {
  const { db } = await requireAdmin();
  const [profiles, tests, bundles, enrollments] = await Promise.all([
    db.from("profiles").select("id,full_name,school_name").order("full_name"),
    db.from("tests").select("id,test_name").order("id"),
    db.from("bundles").select("id,bundle_name").order("id"),
    db
      .from("enrollments")
      .select("user_id,test_id,profiles(full_name),tests(test_name)")
      .order("created_at", { ascending: false }),
  ]);
  if (profiles.error || tests.error || bundles.error || enrollments.error)
    throw new Error("Could not load assignments");
  const studentSelect = (
    <label>
      Student
      <select name="user_id" required>
        {profiles.data.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name || "Unnamed"} · {p.school_name || p.id.slice(0, 8)} ·{" "}
            {p.id.slice(0, 8)}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <>
      <div className="two-grid">
        <section className="panel">
          <h2>Assign a test</h2>
          <AdminForm action="assign-test" label="Grant access">
            {studentSelect}
            <label>
              Test
              <select name="test_id" required>
                {tests.data.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.test_name}
                  </option>
                ))}
              </select>
            </label>
          </AdminForm>
        </section>
        <section className="panel">
          <h2>Assign a bundle</h2>
          <AdminForm action="assign-bundle" label="Assign all bundle tests">
            {studentSelect}
            <label>
              Bundle
              <select name="bundle_id" required>
                {bundles.data.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bundle_name}
                  </option>
                ))}
              </select>
            </label>
          </AdminForm>
        </section>
      </div>
      <h2 className="spaced">Current assignments</h2>
      <div className="admin-list">
        {enrollments.data.map((e) => (
          <details className="panel" key={e.user_id + e.test_id}>
            <summary>
              {(e.profiles as unknown as { full_name: string })?.full_name} ·{" "}
              {(e.tests as unknown as { test_name: string })?.test_name}
            </summary>
            <AdminForm action="revoke-test" label="Revoke access">
              <input name="user_id" type="hidden" value={e.user_id} />
              <input name="test_id" type="hidden" value={e.test_id} />
              <label className="checkbox-label">
                <input type="checkbox" name="confirm" required />
                Confirm removal of access
              </label>
            </AdminForm>
          </details>
        ))}
      </div>
    </>
  );
}
