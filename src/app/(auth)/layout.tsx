import { Brand } from "@/components/brand";
export const metadata = { robots: { index: false, follow: false } };
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Brand />
        <div>
          <span className="eyebrow">ONE STEP CLOSER</span>
          <h2>
            Big dreams.
            <br />
            Daily practice.
            <br />
            <em>Your story.</em>
          </h2>
          <p>
            Make today a small step towards
            <br />
            the future you’re working for.
          </p>
        </div>
        <span>AMU Class 9 & 11 · More possibilities ahead</span>
      </aside>
      <main id="main" className="auth-main">
        {children}
      </main>
    </div>
  );
}
