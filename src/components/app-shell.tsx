"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  Award,
  Calendar,
  MessageCircle,
  User,
  LogOut,
  Shield
} from "lucide-react";
import { Brand } from "./brand";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number }>;
}

export interface AppShellProps {
  navItems: NavItem[];
  userMenu?: {
    name: string;
    email: string;
    onLogout: () => void;
    isAdmin?: boolean;
  };
  ctaButton?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

export function AppShell({ navItems, userMenu, ctaButton, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {/* Top Bar - Always visible */}
      <header className="app-topbar">
        <div className="topbar-container">
          {/* Left: Logo */}
          <div className="topbar-brand" onClick={closeSidebar}>
            <Brand />
          </div>

          {/* Center/Left: Desktop Nav (hidden on mobile) */}
          <nav className="topbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "topbar-link active" : "topbar-link"}
                >
                  {Icon && <Icon size={20} />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Menu or CTA */}
          <div className="topbar-actions">
            {userMenu ? (
              <div className="user-menu-container">
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  <User size={20} />
                  <span className="user-menu-name">{userMenu.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div 
                      className="user-menu-backdrop"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <strong>{userMenu.name}</strong>
                        <span>{userMenu.email}</span>
                      </div>
                      {userMenu.isAdmin && (
                        <Link href="/admin" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                          <Shield size={18} />
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/dashboard/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <User size={18} />
                        Profile
                      </Link>
                      <button className="user-menu-item" onClick={() => {
                        setUserMenuOpen(false);
                        userMenu.onLogout();
                      }}>
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : ctaButton ? (
              <Link href={ctaButton.href} className="button topbar-cta">
                {ctaButton.label}
              </Link>
            ) : null}

            {/* Mobile: Hamburger */}
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={closeSidebar} />
          <aside className="sidebar-drawer">
            <nav className="drawer-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "drawer-link active" : "drawer-link"}
                    onClick={closeSidebar}
                  >
                    {Icon && <Icon size={20} />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile: User Actions */}
            {userMenu && (
              <div className="drawer-user">
                <div className="drawer-user-info">
                  <strong>{userMenu.name}</strong>
                  <span>{userMenu.email}</span>
                </div>
                {userMenu.isAdmin && (
                  <Link href="/admin" className="drawer-link" onClick={closeSidebar}>
                    <Shield size={20} />
                    Admin Panel
                  </Link>
                )}
                <Link href="/dashboard/profile" className="drawer-link" onClick={closeSidebar}>
                  <User size={20} />
                  Profile
                </Link>
                <button
                  className="drawer-link"
                  onClick={() => {
                    closeSidebar();
                    userMenu.onLogout();
                  }}
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            )}

            {ctaButton && !userMenu && (
              <div className="drawer-cta">
                <Link href={ctaButton.href} className="button full" onClick={closeSidebar}>
                  {ctaButton.label}
                </Link>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

// Export preset nav configurations
export const publicNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Exams", href: "/exams", icon: BookOpen },
  { label: "Contact", href: "/contact", icon: MessageCircle },
];

export const dashboardNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Tests", href: "/dashboard/my-tests", icon: FileText },
  { label: "Results", href: "/dashboard/results", icon: Award },
  { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { label: "Doubts", href: "/dashboard/doubts", icon: MessageCircle },
];

export const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Create Test", href: "/admin/create-test", icon: FileText },
  { label: "Assign Tests", href: "/admin/assign-test", icon: Award },
  { label: "Manage Exams", href: "/admin/exams", icon: BookOpen },
  { label: "Bundles", href: "/admin/bundles", icon: Calendar },
];
