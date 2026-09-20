import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Brand } from "@/components/brand";
export const metadata = {
  title: "Admin workspace",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="container section">
      <div className="test-page-header">
        <Brand />
        <Link href="/dashboard">← Student dashboard</Link>
      </div>
      <div className="page-heading">
        <span className="eyebrow">ASPIRE ADMIN</span>
        <h1>Make room for learning.</h1>
      </div>
      <nav className="admin-nav" aria-label="Admin navigation">
        {[
          ["/admin", "Overview"],
          ["/admin/create-test", "Tests"],
          ["/admin/update-questions", "Questions"],
          ["/admin/assign-test", "Assignments"],
          ["/admin/exams", "Exams"],
          ["/admin/bundles", "Bundles"],
        ].map(([url, label]) => (
          <Link key={url} href={url}>
            {label}
          </Link>
        ))}
      </nav>
      <main id="main">{children}</main>
    </div>
  );
}

export const dynamic = "force-dynamic";
