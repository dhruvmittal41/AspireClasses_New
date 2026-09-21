import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Test } from "@/lib/types";

export function TestCard({ test }: { test: Test }) {
  return (
    <article className="block block-action">
      <div className="block-action-content">
        <span
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            background: "var(--paper-hover)",
            color: "var(--primary)",
            marginBottom: "16px",
          }}
        >
          {test.test_category === "demo"
            ? "Free"
            : test.test_category === "upcoming"
              ? "Upcoming"
              : "Practice"}
        </span>

        <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
          {test.test_name}
        </h3>

        <p
          style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "0" }}
        >
          {test.subject_topic || "Entrance exam practice"}
        </p>
      </div>

      <div className="block-action-footer">
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "var(--muted)",
          }}
        >
          <Clock size={16} />
          {test.duration_minutes} min
        </span>
        <Link
          href={"/tests/" + test.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary)",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          Start Test <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
