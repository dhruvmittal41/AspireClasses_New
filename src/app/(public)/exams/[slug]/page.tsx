import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/data";
import { TestCard } from "@/components/test-card";
export const revalidate = 300;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { exams } = await catalog();
  const exam = exams.find((e) => e.slug === slug);
  return {
    title: exam ? `${exam.name} entrance test series` : "Exam not found",
    description: exam?.description,
    alternates: { canonical: "/exams/" + slug },
  };
}
export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { exams, tests, bundles } = await catalog();
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) notFound();
  const available = tests.filter((t) => t.exam_id === exam.id);
  return (
    <main id="main" className="container section">
      <Link href="/exams" className="text-link">
        ← All exams
      </Link>
      <div className="exam-detail-hero">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h1>
          {exam.name}
          <br />
          <em>Start with confidence.</em>
        </h1>
        <p>{exam.description}</p>
        <div className="subject-tags">
          {exam.subjects.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
      <div className="section-heading">
        <div>
          <h2>
            {exam.status === "coming_soon"
              ? "Good things are on the way."
              : "Your practice collection"}
          </h2>
          <p>
            {exam.status === "coming_soon"
              ? "This exam collection is being prepared. Check back for updates."
              : "Build your routine with focused tests and full-length practice."}
          </p>
        </div>
      </div>
      <div className="three-grid">
        {available.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>
      {!available.length && (
        <div className="empty-state">
          <h3>Tests are being prepared</h3>
          <p>Published tests will appear here. Contact us for availability.</p>
          <Link className="text-link" href="/contact">
            Talk to the Aspire team →
          </Link>
        </div>
      )}
      {bundles.some((b) => b.exam_id === exam.id) && (
        <section className="section">
          <h2>Go further with a test series.</h2>
          <div className="three-grid">
            {bundles
              .filter((b) => b.exam_id === exam.id)
              .map((b) => (
                <article className="panel" key={b.id}>
                  <span className="badge">Test bundle</span>
                  <h3>{b.bundle_name}</h3>
                  <p>{b.description}</p>
                  <strong className="price">₹{b.price}</strong>
                  <Link href={"/details/bundle/" + b.id} className="button">
                    View bundle →
                  </Link>
                </article>
              ))}
          </div>
        </section>
      )}
      <p className="fine-print">
        Independent practice material. Please check the university’s official
        admission notice for current eligibility, syllabus, dates, and exam
        rules.
      </p>
    </main>
  );
}
