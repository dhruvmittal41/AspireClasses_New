import { requireAdmin } from "@/lib/auth";
import { PasswordRequestReview } from "@/components/password-request-review";

export default async function PasswordRequests() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("password_help_requests").select("id,email,contact,status,created_at")
    .eq("status", "pending").order("created_at", { ascending: true }).limit(100);
  if (error) throw new Error("Password requests could not be loaded. Check that the password-help migration is installed.");
  return <>
    <h2>Password requests</h2>
    <p>Pending requests, oldest first. No reset emails are sent.</p>
    {!data.length && <p>No pending requests.</p>}
    <div className="admin-list">{data.map(request => <details key={request.id}>
      <summary>{request.email} · {new Date(request.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</summary>
      <p>Requested contact: {request.contact}</p>
      <PasswordRequestReview id={request.id} />
    </details>)}</div>
  </>;
}
