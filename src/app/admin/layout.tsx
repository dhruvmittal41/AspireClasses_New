import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";

export const metadata = {
  title: "Admin workspace",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
export const dynamic = "force-dynamic";
