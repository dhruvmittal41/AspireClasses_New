import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/data";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { bundles } = await catalog();
  const b = bundles.find((b) => b.id === Number(id));
  return {
    title: b?.bundle_name || "Bundle",
    description: b?.description,
    alternates: { canonical: "/details/bundle/" + id },
  };
}
export default async function BundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { bundles } = await catalog();
  const b = bundles.find((b) => b.id === Number(id));
  if (!b) notFound();
  return (
    <main id="main" className="container section narrow">
      <Link href="/exams">← Explore exams</Link>
      <div className="page-heading">
        <span className="eyebrow">A PLAN FOR YOUR PROGRESS</span>
        <h1>{b.bundle_name}</h1>
        <p>{b.description}</p>
      </div>
      <div className="panel">
        <strong className="price">₹{b.price}</strong>
        <ul className="feature-list">
          {b.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <Link href={"/payment/bundle/" + b.id} className="button">
          Continue to enrollment →
        </Link>
        <p className="fine-print">
          Access is assigned after the Aspire team confirms your enrollment.
        </p>
      </div>
    </main>
  );
}
