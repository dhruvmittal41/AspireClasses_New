import Link from "next/link";
import { Users, FileText, HelpCircle, CheckSquare, ArrowUpRight, ListChecks, KeyRound } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";

export default async function Admin() {
  const { db } = await requireAdmin();
  const [profiles, tests, questions, results, recent] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("tests").select("id", { count: "exact", head: true }),
    db.from("questions").select("id", { count: "exact", head: true }),
    db.from("results").select("id", { count: "exact", head: true }),
    db.from("tests").select("id,test_name,published,duration_minutes,questions(count)").order("id", { ascending: false }).limit(6),
  ]);
  if ([profiles, tests, questions, results, recent].some(r => r.error)) throw new Error("Could not load overview");
  const stats = [{ icon: Users, count: profiles.count, label: "Accounts", href: "/admin/assign-test" },
    { icon: FileText, count: tests.count, label: "Tests", href: "/admin/create-test" },
    { icon: HelpCircle, count: questions.count, label: "Questions", href: "/admin/update-questions" },
    { icon: CheckSquare, count: results.count, label: "Completed attempts" }];
  return <div className="admin-overview">
    <div className="workspace-intro"><div><h2>A clear view of your classroom</h2><p>Keep your tests ready and your students moving forward.</p></div><Link className="button" href="/admin/create-test">Manage tests <ArrowUpRight size={17} /></Link></div>
    <div className="admin-metrics">{stats.map(({ icon: Icon, count, label, href }) => <div className="panel admin-metric" key={label}><Icon size={21} /><strong>{(count || 0).toLocaleString("en-IN")}</strong>{href ? <Link href={href}>{label} <ArrowUpRight size={14} /></Link> : <span>{label}</span>}</div>)}</div>
    <section className="panel"><div className="workspace-intro"><div><h2>Recent tests</h2><p>Your latest drafts and published tests.</p></div><Link className="text-link" href="/admin/create-test">View library →</Link></div>
      {!recent.data?.length && <div className="workspace-empty"><h3>Your first test starts here</h3><p>Create a draft, add questions, then publish it for students.</p><Link className="button" href="/admin/create-test">Create a test</Link></div>}
      <div className="admin-records">{recent.data?.map(t => <div className="admin-record" key={t.id}><div><strong>{t.test_name}</strong><span>{t.questions[0]?.count || 0} questions · {t.duration_minutes} min</span></div><span className={"status-pill " + (t.published ? "is-published" : "")}>{t.published ? "Published" : "Draft"}</span><Link href={"/admin/update-questions?test=" + t.id} className="text-link" aria-label={"Edit questions for " + t.test_name}>Questions →</Link></div>)}</div>
    </section>
    <div className="admin-shortcuts">{[{ href: "/admin/update-questions", icon: ListChecks, title: "Build your question bank", text: "Add and refine test questions." }, { href: "/admin/assign-test", icon: Users, title: "Manage student access", text: "Assign tests after verifying payment." }, { href: "/admin/password-requests", icon: KeyRound, title: "Help students sign in", text: "Review password help requests." }].map(({ href, icon: Icon, title, text }) => <Link className="panel" href={href} key={href}><Icon size={22} /><h3>{title}</h3><p>{text}</p><ArrowUpRight size={18} /></Link>)}</div>
  </div>;
}
