"use client";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="nav-pending" role="status" aria-label="Loading page" /> : null;
}

export function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const active = usePathname() === href;
  return <Link href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}>
    {children}<Pending />
  </Link>;
}
