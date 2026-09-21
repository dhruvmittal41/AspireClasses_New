import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { db, user, profile } = await requireUser();
  const { data: isAdmin } = await db.rpc("is_admin");

  return (
    <DashboardShell
      name={profile.full_name}
      email={user.email || ""}
      isAdmin={isAdmin === true}
    >
      {children}
    </DashboardShell>
  );
}

export const dynamic = "force-dynamic";
