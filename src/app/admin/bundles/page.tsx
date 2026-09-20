import { requireAdmin } from "@/lib/admin-auth";
import { AdminForm } from "@/components/admin-form";
import type { Bundle, Exam } from "@/lib/types";
function Fields({ bundle, exams }: { bundle?: Bundle; exams: Exam[] }) {
  return (
    <>
      {bundle && <input name="id" type="hidden" value={bundle.id} />}
      <label>
        Bundle name
        <input name="bundle_name" defaultValue={bundle?.bundle_name} required />
      </label>
      <label>
        Exam
        <select name="exam_id" defaultValue={bundle?.exam_id}>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      <label className="span-two">
        Description
        <textarea name="description" defaultValue={bundle?.description} />
      </label>
      <label>
        Price (₹)
        <input
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={bundle?.price || 0}
          required
        />
      </label>
      <label>
        Features (one per line)
        <textarea name="features" defaultValue={bundle?.features.join("\n")} />
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="published"
          defaultChecked={bundle?.published}
        />
        Published
      </label>
    </>
  );
}
export default async function Bundles() {
  const { db } = await requireAdmin();
  const [bundles, exams, tests, links] = await Promise.all([
    db.from("bundles").select("*").order("id"),
    db.from("exams").select("*").order("sort_order"),
    db.from("tests").select("id,test_name").order("id"),
    db.from("bundle_tests").select("*"),
  ]);
  if (bundles.error || exams.error || tests.error || links.error)
    throw new Error("Could not load bundles");
  return (
    <>
      <section className="panel">
        <h2>Create a bundle</h2>
        <AdminForm action="save-bundle" label="Create bundle">
          <Fields exams={exams.data} />
        </AdminForm>
      </section>
      <div className="admin-list spaced">
        {bundles.data.map((b) => (
          <details className="panel" key={b.id}>
            <summary>
              {b.bundle_name} · ₹{b.price}
            </summary>
            <AdminForm action="save-bundle">
              <Fields bundle={b} exams={exams.data} />
            </AdminForm>
            <h3>Included tests</h3>
            {links.data
              .filter((l) => l.bundle_id === b.id)
              .map((l) => (
                <AdminForm
                  key={l.test_id}
                  action="remove-bundle-test"
                  label="Remove from bundle"
                >
                  <input name="bundle_id" type="hidden" value={b.id} />
                  <input name="test_id" type="hidden" value={l.test_id} />
                  <p>{tests.data.find((t) => t.id === l.test_id)?.test_name}</p>
                </AdminForm>
              ))}
            <AdminForm action="bundle-test" label="Add test to bundle">
              <input name="bundle_id" type="hidden" value={b.id} />
              <label>
                Test
                <select name="test_id">
                  {tests.data.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.test_name}
                    </option>
                  ))}
                </select>
              </label>
            </AdminForm>
          </details>
        ))}
      </div>
    </>
  );
}
