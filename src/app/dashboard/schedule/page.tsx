import { requireUser } from "@/lib/auth";
import { TestCard } from "@/components/test-card";
import type { Test } from "@/lib/types";
export const metadata = { title: "Test schedule" };
export default async function Schedule() {
  const { db } = await requireUser();
  const { data, error } = await db
    .from("tests")
    .select("*")
    .eq("published", true)
    .not("date_scheduled", "is", null)
    .gte("date_scheduled", new Date().toISOString())
    .order("date_scheduled");
  if (error) throw error;
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">MAKE A LITTLE ROOM</span>
        <h1>Your practice calendar.</h1>
        <p>Upcoming test openings. All times shown in India Standard Time.</p>
      </div>
      {data.length ? (
        <div className="three-grid">
          {(data as Test[]).map((t) => (
            <div key={t.id}>
              <p className="eyebrow">
                {new Date(t.date_scheduled!).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </p>
              <TestCard test={t} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No upcoming dates yet.</h3>
          <p>Scheduled tests will appear here when published.</p>
        </div>
      )}
    </>
  );
}
