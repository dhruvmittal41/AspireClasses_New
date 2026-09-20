import { catalog } from "@/lib/data";
import { CatalogBrowser } from "@/components/catalog-browser";
import { TestCard } from "@/components/test-card";
export const revalidate = 300;
export const metadata = {
  title: "Explore entrance exam test series",
  description:
    "Find AMU Class 9 and Class 11 entrance practice, free demo tests, and upcoming exam collections.",
  alternates: { canonical: "/exams" },
};
export default async function Exams() {
  const { exams, tests } = await catalog();
  const demos = tests.filter((t) => t.test_category === "demo");
  return (
    <main id="main" className="container section">
      <div className="page-heading">
        <span className="eyebrow">MAKE ROOM FOR YOUR AMBITION</span>
        <h1>Find your next chapter.</h1>
        <p>Focused practice for the entrance exam that matters to you.</p>
      </div>
      <CatalogBrowser exams={exams} />
      <section className="section" id="free-practice">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
            <h2>Try a little free practice.</h2>
          </div>
        </div>
        {demos.length ? (
          <div className="three-grid">
            {demos.map((t) => (
              <TestCard key={t.id} test={t} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Your first practice starts here.</h3>
            <p>
              Free demo tests will appear here as soon as they are published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
