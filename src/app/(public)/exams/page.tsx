import { catalog } from "@/lib/data";
import { CatalogBrowser } from "@/components/catalog-browser";
import { TestCard } from "@/components/test-card";

export const revalidate = 300;
export const metadata = {
  title: "Entrance Exam Test Series",
  description: "AMU Class 9 and Class 11 entrance practice tests and demos.",
  alternates: { canonical: "/exams" },
};

export default async function Exams() {
  const { exams, tests } = await catalog();
  const demos = tests.filter((t) => t.test_category === "demo");

  return (
    <main id="main" className="container section">
      <div className="page-heading">
        <h1>Entrance Exams</h1>
        <p>Choose your exam and start practicing</p>
      </div>

      <CatalogBrowser exams={exams} />

      <section className="section" id="free-practice">
        <div className="section-heading">
          <h2>Free Demo Tests</h2>
        </div>
        {demos.length ? (
          <div className="three-grid">
            {demos.map((t) => (
              <TestCard key={t.id} test={t} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No demos yet</h3>
            <p>Check back soon</p>
          </div>
        )}
      </section>
    </main>
  );
}
