"use client";

import { useRouter } from "next/navigation";
import { AppShell, dashboardNavItems } from "./app-shell";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useState } from "react";

export function DashboardShell({
  name,
  email,
  isAdmin,
  children,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleLogout() {
    const { error } = await supabaseBrowser().auth.signOut();
    if (error) { setError("Could not sign out. Please retry."); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <AppShell
      navItems={dashboardNavItems}
      userMenu={{
        name,
        email,
        onLogout: handleLogout,
        isAdmin,
      }}
    >
      <main id="main">
        {error && <p role="alert" className="error-message">{error}</p>}
        {children}
      </main>
    </AppShell>
  );
}
