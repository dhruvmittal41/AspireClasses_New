import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Test } from "@/lib/types";
export function TestCard({ test }: { test: Test }) {
  return (
    <article className="panel test-card">
      <span className="badge">
        {test.test_category === "demo"
          ? "Free practice"
          : test.test_category === "upcoming"
            ? "Upcoming"
            : "Practice test"}
      </span>
      <h3>{test.test_name}</h3>
      <p>{test.subject_topic || "Entrance exam practice"}</p>
      <div className="test-card-bottom">
        <span>
          <Clock3 size={16} />
          {test.duration_minutes} minutes
        </span>
        <Link className="text-link" href={"/tests/" + test.id}>
          View test <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
