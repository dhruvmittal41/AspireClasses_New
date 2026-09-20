import { requireUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";
export const metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  return (
    <div className="dashboard-layout">
      <DashboardNav name={profile.full_name} admin={profile.role === "admin"} />
      <main id="main" className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export const dynamic = "force-dynamic";
