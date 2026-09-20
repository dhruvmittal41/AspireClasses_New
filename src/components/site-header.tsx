"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button
          className="menu-toggle icon-button"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          className={open ? "public-nav open" : "public-nav"}
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
        >
          <Link href="/exams">Explore exams</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/contact">Get in touch</Link>
          <Link href="/login" className="nav-login">
            Log in
          </Link>
          <Link href="/register" className="button small">
            Start preparing <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
