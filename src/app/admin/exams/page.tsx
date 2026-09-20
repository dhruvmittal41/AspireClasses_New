import { requireAdmin } from "@/lib/auth";
import { AdminForm } from "@/components/admin-form";
import type { Exam } from "@/lib/types";
function Fields({ exam }: { exam?: Exam & { sort_order: number } }) {
  return (
    <>
      <label>
        Stable ID (lowercase, hyphens)
        <input
          name="id"
          defaultValue={exam?.id}
          readOnly={!!exam}
          pattern="[a-z0-9-]+"
          required
        />
      </label>
      <label>
        URL slug
        <input
          name="slug"
          defaultValue={exam?.slug}
          pattern="[a-z0-9-]+"
          required
        />
      </label>
      <label>
        Name
        <input name="name" defaultValue={exam?.name} required />
      </label>
      <label>
        Availability
        <select name="status" defaultValue={exam?.status || "coming_soon"}>
          <option value="active">Active</option>
          <option value="coming_soon">Coming soon</option>
        </select>
      </label>
      <label className="span-two">
        Description
        <textarea
          name="description"
          defaultValue={exam?.description}
          minLength={10}
          required
        />
      </label>
      <label>
        Subjects (comma separated)
        <input
          name="subjects"
          defaultValue={exam?.subjects.join(", ")}
          required
        />
      </label>
      <label>
        Display order
        <input
          name="sort_order"
          type="number"
          min={0}
          defaultValue={exam?.sort_order || 0}
        />
      </label>
    </>
  );
}
export default async function Exams() {
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from("exams")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (
    <>
      <div className="panel">
        <h2>Add an exam collection</h2>
        <AdminForm action="save-exam" label="Create exam">
          <Fields />
        </AdminForm>
      </div>
      <div className="admin-list spaced">
        {data.map((e) => (
          <details key={e.id} className="panel">
            <summary>{e.name}</summary>
            <AdminForm action="save-exam">
              <Fields exam={e} />
            </AdminForm>
          </details>
        ))}
      </div>
    </>
  );
}
