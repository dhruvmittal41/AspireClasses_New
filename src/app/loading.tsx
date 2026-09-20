export default function Loading() {
  return (
    <main id="main" className="container section" aria-busy="true">
      <p role="status">Getting things ready…</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </main>
  );
}
