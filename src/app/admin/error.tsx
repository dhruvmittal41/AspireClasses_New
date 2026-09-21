"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="panel workspace-empty" role="alert">
    <h2>We couldn’t load this workspace</h2>
    <p>Your data hasn’t been changed. Check your connection and try again.</p>
    <button className="button" onClick={reset}>Try again</button>
  </section>;
}
