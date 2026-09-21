import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const noBox: CSSProperties = {
  background: "none",
  border: "none",
  borderRadius: 0,
  padding: 0,
};

/*
 * Logo size: change the h-* values below (width follows automatically from
 * the 5:2 ratio).  h-12 = 48px, h-20 = 80px, h-24 = 96px, h-28 = 112px.
 * Keep `sizes` in step: width = height x 2.5
 *
 * Default = website header/footer.  `compact` = dashboard sidebar.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex w-auto shrink-0 items-center aspect-[5/2] ${
        compact ? "h-12 lg:h-20" : "h-20 sm:h-24 lg:h-28"
      }`}
    >
      <Image
        src="/aspire.png"
        alt="Aspire Classes"
        fill
        sizes={
          compact
            ? "(max-width: 1024px) 120px, 200px"
            : "(max-width: 640px) 200px, (max-width: 1024px) 240px, 280px"
        }
        style={noBox}
        className="object-contain object-left mix-blend-multiply"
        priority
      />
    </div>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Aspire Classes home"
      style={noBox}
      className="inline-flex shrink-0 items-center !bg-transparent !p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
    >
      <Logo compact={compact} />
    </Link>
  );
}