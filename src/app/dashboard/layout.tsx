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
  const { db, profile } = await requireUser();
  const { data: isAdmin } = await db.rpc("is_admin");
  return (
    <div className="dashboard-layout">
      <DashboardNav name={profile.full_name} admin={isAdmin === true} />
      <main id="main" className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export const dynamic = "force-dynamic";
