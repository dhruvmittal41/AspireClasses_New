import Link from "next/link";
import { ArrowUpRight, BookOpen, GraduationCap } from "lucide-react";
import type { Exam } from "@/lib/types";
export function ExamCard({ exam, index = 0 }: { exam: Exam; index?: number }) {
  const soon = exam.status === "coming_soon";
  return (
    <article className={"exam-card tone-" + (index % 4)}>
      <div className="card-top">
        <span className="exam-icon">
          {index % 2 ? <GraduationCap /> : <BookOpen />}
        </span>
        <span className={soon ? "badge muted" : "badge"}>
          {soon ? "Coming soon" : "Explore series"}
        </span>
      </div>
      <span className="eyebrow">
        {exam.name.startsWith("AMU")
          ? "ALIGARH MUSLIM UNIVERSITY"
          : "YOUR NEXT OPPORTUNITY"}
      </span>
      <h3>{exam.name}</h3>
      <p>{exam.description}</p>
      <div className="subject-tags">
        {exam.subjects.slice(0, 3).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <Link className="card-link" href={"/exams/" + exam.slug}>
        {soon ? "Learn more" : "Explore test series"}
        <ArrowUpRight size={20} />
      </Link>
    </article>
  );
}
