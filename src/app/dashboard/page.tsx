import Link from "next/link";
import { ArrowUpRight, Target, BookOpen, TrendingUp, Award } from "lucide-react";
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
      {/* Hero Block */}
      <section className="block-section">
        <div className="block-container">
          <div className="block-hero">
            <h1>Hey {profile.full_name.split(" ")[0] || "there"} 👋</h1>
            <p>Your dashboard for test preparation</p>
            <Link href="/dashboard/my-tests" className="button light">
              My Tests <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="block-section" style={{ paddingTop: 0 }}>
        <div className="block-container">
          <div className="block-grid block-grid-3">
            <div className="block block-stat">
              <div className="block-stat-icon">
                <BookOpen size={28} />
              </div>
              <strong className="block-stat-value">
                {enrollments.count || 0}
              </strong>
              <span className="block-stat-label">Assigned</span>
            </div>

            <div className="block block-stat">
              <div className="block-stat-icon">
                <Target size={28} />
              </div>
              <strong className="block-stat-value">{scores.length}</strong>
              <span className="block-stat-label">Completed</span>
            </div>

            <div className="block block-stat">
              <div className="block-stat-icon">
                <TrendingUp size={28} />
              </div>
              <strong className="block-stat-value">
                {avg === null ? "—" : avg + "%"}
              </strong>
              <span className="block-stat-label">Avg Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Tests */}
      <section className="block-section">
        <div className="block-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <h2 style={{ margin: 0 }}>Demo Tests</h2>
            <Link
              href="/exams"
              style={{
                fontSize: "15px",
                color: "var(--primary)",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              View All <ArrowUpRight size={18} />
            </Link>
          </div>

          {demos.data.length ? (
            <div className="block-grid block-grid-3">
              {(demos.data as Test[]).map((t) => (
                <TestCard key={t.id} test={t} />
              ))}
            </div>
          ) : (
            <div className="block block-empty">
              <h3>No tests available</h3>
              <p>Check back soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Results */}
      {scores.length > 0 && (
        <section className="block-section" style={{ paddingTop: 0 }}>
          <div className="block-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <h2 style={{ margin: 0 }}>Recent Results</h2>
              <Link
                href="/dashboard/results"
                style={{
                  fontSize: "15px",
                  color: "var(--primary)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                View All <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="block">
              <div className="block-list">
                {scores.slice(0, 3).map((result, i) => {
                  const percentage = result.total_marks
                    ? Math.round((result.score / result.total_marks) * 100)
                    : 0;

                  return (
                    <div key={i} className="block-list-item">
                      <div className="block-list-icon">
                        <Award size={20} />
                      </div>
                      <div className="block-list-content">
                        <div className="block-list-title">
                          {(Array.isArray(result.tests) ? result.tests[0]?.test_name : (result.tests as { test_name?: string } | null)?.test_name) || "Test"}
                        </div>
                        <div className="block-list-meta">
                          {new Date(result.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "var(--primary)",
                        }}
                      >
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
