"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";

const mainLinks = [
  { href: "/#why-us", label: "Why us" },
  { href: "/exams", label: "Test series" },
  { href: "/#features", label: "Features" },
  { href: "/contact", label: "Contact" },
];

/*
 * The "!" (important) modifiers below make sure these styles win over any old
 * global rules such as `nav a { ... }` still sitting in globals.css.
 * Once you delete those old rules you can safely remove the "!" prefixes.
 * Full class strings are written out so Tailwind can detect them.
 */
const linkStyle =
  "block !rounded-sm !border-0 !bg-transparent !px-1 !py-3 !shadow-none text-[17px] font-medium italic tracking-wide !text-stone-800 decoration-emerald-700 decoration-2 underline-offset-[10px] transition-colors duration-200 hover:!text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6EA] md:!py-1 lg:text-lg";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E3D8BC] bg-[#FBF6EA]/90 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(60,45,20,0.08)]">
      {/* Height grows with the logo, so it can never be clipped */}
      <div className="mx-auto flex min-h-[80px] max-w-7xl items-center justify-between px-6 py-1.5 lg:min-h-[96px] lg:px-8">
        <Brand />

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-stone-800 transition-colors hover:bg-[#F4EBD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 md:hidden"
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Navigation: dropdown panel on mobile, inline row on desktop */}
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
          className={`${
            open ? "flex" : "hidden"
          } absolute inset-x-0 top-full flex-col border-t border-[#E3D8BC] bg-[#FBF6EA] px-6 pb-6 pt-3 shadow-[0_16px_24px_-8px_rgba(60,45,20,0.18)] md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-9`}
        >
          {mainLinks.map((item) => (
            <Link key={item.href} href={item.href} className={linkStyle}>
              {item.label}
            </Link>
          ))}

          {/* Divider between site links and account actions (desktop only) */}
          <span
            aria-hidden="true"
            className="hidden h-7 w-px bg-[#D9CBA6] md:block"
          />

          <Link href="/login" className={linkStyle}>
            Log in
          </Link>

          <Link
            href="/register"
            className="group mt-3 inline-flex w-full items-center justify-center gap-1.5 !rounded-full !border-0 !bg-emerald-800 !px-7 !py-3 text-base font-semibold !text-white !shadow-md !shadow-emerald-900/20 transition-all duration-300 hover:!bg-emerald-900 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6EA] md:mt-0 md:w-auto lg:text-[17px]"
          >
            Register
            <ArrowUpRight
              size={18}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}