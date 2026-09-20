"use client";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { setQuery, setExam, type RootState } from "@/store/store";
import { ExamCard } from "./exam-card";
import type { Exam } from "@/lib/types";
export function CatalogBrowser({ exams }: { exams: Exam[] }) {
  const { query, exam } = useSelector((s: RootState) => s.catalog);
  const dispatch = useDispatch();
  const filtered = exams.filter(
    (e) =>
      (exam === "all" || e.status === exam) &&
      `${e.name} ${e.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="catalog-toolbar">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Exam availability"
        >
          {[
            ["all", "All exams"],
            ["active", "Available"],
            ["coming_soon", "Coming soon"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={exam === value}
              className={exam === value ? "active" : ""}
              onClick={() => dispatch(setExam(value))}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search exams"
            placeholder="Find your exam…"
            value={query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
          />
        </label>
      </div>
      <div className="exam-grid">
        {filtered.map((e, i) => (
          <ExamCard key={e.id} exam={e} index={i} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>No exams found</h3>
          <p>Try another name or change the filter.</p>
        </div>
      )}
    </>
  );
}
