import Link from "next/link";
import { ArrowUpRight, Target, BookOpen, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { TestCard } from "@/components/test-card";
import type { Test } from "@/lib/types";
export default async function Dashboard() {
  const { db, user, profile } = await requireUser();
  const [results, enrollments, demos] = await Promise.all([
    db
      .from("results")
      .select("score,total_marks,submitted_at,tests(test_name)")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false }),
    db
      .from("enrollments")
      .select("test_id", { count: "exact", head: true })
      .eq("user_id", user.id),
    db
      .from("tests")
      .select("*")
      .eq("published", true)
      .eq("test_category", "demo")
      .limit(3),
  ]);
  if (results.error || enrollments.error || demos.error)
    throw new Error("Dashboard unavailable");
  const scores = results.data || [];
  const avg = scores.length
    ? Math.round(
        scores.reduce(
          (s, r) => s + (r.total_marks ? (r.score / r.total_marks) * 100 : 0),
          0,
        ) / scores.length,
      )
    : null;
  return (
    <>
      <div className="dashboard-topline">
        <span>YOUR PREPARATION, AT A GLANCE</span>
        <Link href="/exams">Explore exams ↗</Link>
      </div>
      <div className="page-heading">
        <span className="eyebrow">EVERY STEP COUNTS</span>
        <h1>
          Hello, {profile.full_name.split(" ")[0] || "there"}{" "}
          <span className="wave">✳</span>
        </h1>
        <p>
          A fresh opportunity to get a little better. What will you practise
          today?
        </p>
      </div>
      <div className="dashboard-banner">
        <div>
          <span className="eyebrow">SHOW UP FOR YOUR FUTURE SELF</span>
          <h2>
            Small steps.
            <br />
            Stronger foundations.
          </h2>
          <p>Pick a test, find your focus, and make today count.</p>
          <Link href="/dashboard/my-tests" className="button light">
            Continue preparing <ArrowUpRight size={17} />
          </Link>
        </div>
        <span className="banner-art" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="stats-grid">
        {[
          [BookOpen, enrollments.count || 0, "Assigned tests"],
          [Target, scores.length, "Completed attempts"],
          [TrendingUp, avg === null ? "—" : avg + "%", "Average score"],
        ].map(([Icon, value, label]) => {
          const I = Icon as typeof BookOpen;
          return (
            <div className="stat-card" key={String(label)}>
              <I size={22} />
              <strong>{String(value)}</strong>
              <span>{String(label)}</span>
            </div>
          );
        })}
      </div>
      <div className="section-heading">
        <div>
          <h2>A little practice goes a long way.</h2>
          <p>Start with a free demo test.</p>
        </div>
        <Link href="/exams#free-practice" className="text-link">
          View all ↗
        </Link>
      </div>
      {demos.data.length ? (
        <div className="three-grid">
          {(demos.data as Test[]).map((t) => (
            <TestCard key={t.id} test={t} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Your practice space is ready.</h3>
          <p>Demo tests will appear here when the team publishes them.</p>
        </div>
      )}
      <div className="section-heading spaced">
        <h2>Your progress story</h2>
        <Link href="/dashboard/results" className="text-link">
          See results ↗
        </Link>
      </div>
      <div className="panel">
        <p>
          {scores.length
            ? `You’ve completed ${scores.length} attempt${scores.length === 1 ? "" : "s"}. Keep practising and use each result to guide your next revision.`
            : "Your first result is a starting point, not a final verdict. Complete a test to begin tracking your progress."}
        </p>
      </div>
    </>
  );
}
