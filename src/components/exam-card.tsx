import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Exam } from "@/lib/types";

export function ExamCard({ exam }: { exam: Exam; index?: number }) {
  const soon = exam.status === "coming_soon";

  return (
    <article className="block block-action">
      <div className="block-action-content">
        <div className="block-feature-icon" style={{ margin: "0 0 16px 0" }}>
          <BookOpen size={24} />
        </div>

        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>{exam.name}</h3>
        <p
          style={{
            fontSize: "15px",
            color: "var(--muted)",
            marginBottom: "16px",
          }}
        >
          {exam.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {exam.subjects.slice(0, 3).map((s) => (
            <span
              key={s}
              style={{
                fontSize: "13px",
                padding: "4px 12px",
                borderRadius: "6px",
                background: "var(--paper-hover)",
                color: "var(--muted)",
                fontWeight: "500",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="block-action-footer">
        <Link
          href={"/exams/" + exam.slug}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary)",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          {soon ? "Coming Soon" : "View Details"}
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
