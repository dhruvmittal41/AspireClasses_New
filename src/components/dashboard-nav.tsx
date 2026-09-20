"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesCombined,
  CalendarDays,
  MessageCircle,
  UserRound,
  LogOut,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { resetAttempt } from "@/store/store";
import { useState } from "react";
import { Brand } from "./brand";
import { supabaseBrowser } from "@/lib/supabase/browser";
export function DashboardNav({
  name,
  admin,
}: {
  name: string;
  admin: boolean;
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState("");
  const links = [
    ["/dashboard", "Overview", LayoutDashboard],
    ["/dashboard/my-tests", "My tests", BookOpen],
    ["/dashboard/results", "My results", ChartNoAxesCombined],
    ["/dashboard/schedule", "Test schedule", CalendarDays],
    ["/exams", "Explore exams", Compass],
    ["/dashboard/doubts", "Ask a doubt", MessageCircle],
    ["/dashboard/profile", "My profile", UserRound],
  ] as const;
  async function logout() {
    const { error } = await supabaseBrowser().auth.signOut();
    if (error) {
      setError("Could not sign out. Please retry.");
      return;
    }
    dispatch(resetAttempt());
    router.replace("/login");
    router.refresh();
  }
  return (
    <aside className="dashboard-sidebar">
      <Brand />
      <span className="sidebar-label">YOUR LEARNING SPACE</span>
      <nav aria-label="Student navigation">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
        {admin && (
          <Link href="/admin">
            <ShieldCheck size={19} />
            Admin tools
          </Link>
        )}
        <button className="text-button mobile-signout" onClick={logout}>
          <LogOut size={16} />
          Sign out
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="student-identity">
          <span>{name.charAt(0) || "A"}</span>
          <div>
            <strong>{name || "Aspire student"}</strong>
            <small>Keep moving forward</small>
          </div>
        </div>
        <button className="text-button" onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    </aside>
  );
}
