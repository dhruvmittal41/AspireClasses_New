import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Update this interface to allow any properties on the exam object
interface ExamCardProps {
  exam: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    [key: string]: any; // Allows flexible property matching
  };
  index: number;
}

export function ExamCard({ exam, index }: ExamCardProps) {
  const title = exam.title || exam.name || "Untitled Exam";

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 border border-[#E3D8BC] shadow-md hover:shadow-2xl shadow-stone-900/5 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/60">
            AMU Entrance
          </span>
          <span className="text-xs font-mono font-semibold text-stone-400">
            0{index + 1}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-stone-900 tracking-tight leading-snug group-hover:text-emerald-800 transition-colors duration-200">
          {title}
        </h3>

        {exam.description && (
          <p className="mt-2 text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {exam.description}
          </p>
        )}
      </div>

      <div className="mt-6 pt-2">
        <Link
          href={`/exams/${exam.id}`}
          className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-900"
        >
          <span>Explore Series</span>
          <ArrowUpRight
            size={18}
            className="transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}