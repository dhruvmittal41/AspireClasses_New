"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, ListChecks, Users, GraduationCap, Package, KeyRound, Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
import { NavLink } from "./nav-link";

const links = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/create-test", "Tests", FileText],
  ["/admin/update-questions", "Questions", ListChecks],
  ["/admin/assign-test", "Assignments", Users],
  ["/admin/exams", "Exams", GraduationCap],
  ["/admin/bundles", "Bundles", Package],
  ["/admin/password-requests", "Password requests", KeyRound],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = links.find(([href]) => pathname === href)?.[1] || "Admin";
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand-row"><Brand /><button className="admin-menu-toggle icon-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="admin-menu" aria-label={open ? "Close admin menu" : "Open admin menu"}>{open ? <X /> : <Menu />}</button></div>
      <nav id="admin-menu" className={open ? "admin-side-nav is-open" : "admin-side-nav"} aria-label="Admin navigation">
        {links.map(([href, label, Icon]) => <NavLink key={href} href={href} onClick={() => setOpen(false)}><Icon size={20} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="admin-sidebar-footer"><Link href="/dashboard">Student dashboard <ArrowUpRight size={17} /></Link><Link href="/">View website <ArrowUpRight size={17} /></Link></div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><div><span className="eyebrow">ASPIRE ADMIN</span><h1>{title}</h1></div><Link className="button small" href="/admin/create-test">Manage tests</Link></header>
      <main id="main" className="admin-content">{children}</main>
    </div>
  </div>;
}
