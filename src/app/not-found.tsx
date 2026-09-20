import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container section narrow">
      <span className="eyebrow">404 · A SMALL DETOUR</span>
      <h1>This page isn’t here.</h1>
      <p>Let’s get you back to your next step.</p>
      <Link className="button" href="/exams">
        Explore exams →
      </Link>
    </main>
  );
}
