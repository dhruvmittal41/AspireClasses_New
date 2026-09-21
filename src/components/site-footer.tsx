import Link from "next/link";
import { Brand } from "./brand";

const examLinks = [
  { href: "/exams/amu-class-9", label: "AMU Class 9" },
  { href: "/exams/amu-class-11", label: "AMU Class 11" },
  { href: "/exams", label: "All entrance exams" },
];

const supportLinks = [
  { href: "/contact", label: "Contact us" },
  { href: "/dashboard", label: "Student dashboard" },
];

// Support email. The button opens Gmail's compose window in a new tab, because a
// plain mailto: link does nothing on computers with no default email app.
const supportEmail = "aspireclasses51@gmail.com";
const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${encodeURIComponent(
  "Support request - Aspire Classes"
)}`;

// Shared link styles. Full class strings are written out so Tailwind can detect them.
const linkBase =
  "w-fit rounded-sm text-base text-stone-700 underline-offset-4 decoration-2 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6EA]";
const examLink = `${linkBase} hover:text-amber-800 hover:decoration-amber-600 focus-visible:ring-amber-600`;
const supportLink = `${linkBase} hover:text-emerald-800 hover:decoration-emerald-600 focus-visible:ring-emerald-600`;

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-[#E3D8BC] bg-[#FBF6EA] text-stone-700">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand and tagline */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-6 lg:pr-12">
            <Brand />
            <p className="font-serif text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              <span className="block text-amber-700">A little practice today.</span>
              <span className="block text-emerald-800">
                A bigger possibility tomorrow.
              </span>
            </p>
            <p className="max-w-md text-base leading-relaxed text-stone-600">
              Preparation for AMU Class 9 and Class 11 entrance exams.
            </p>
          </div>

          {/* Exams */}
          <nav
            aria-labelledby="footer-exams-heading"
            className="flex flex-col gap-3 lg:col-span-3"
          >
            <h2
              id="footer-exams-heading"
              className="mb-2 w-fit border-b-2 border-amber-600 pb-2 text-lg font-semibold tracking-tight text-stone-900"
            >
              Find your exam
            </h2>
            {examLinks.map((item) => (
              <Link key={item.href} href={item.href} className={examLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Support */}
          <nav
            aria-labelledby="footer-support-heading"
            className="flex flex-col gap-3 lg:col-span-3"
          >
            <h2
              id="footer-support-heading"
              className="mb-2 w-fit border-b-2 border-emerald-700 pb-2 text-lg font-semibold tracking-tight text-stone-900"
            >
              Here to help
            </h2>
            {supportLinks.map((item) => (
              <Link key={item.href} href={item.href} className={supportLink}>
                {item.label}
              </Link>
            ))}
            <a
              href={gmailCompose}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-800/25 bg-white px-5 py-2.5 text-base font-medium text-emerald-900 shadow-sm transition-colors duration-200 hover:border-orange-800 hover:bg-orange-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6EA]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Email support
            </a>
            <p className="text-sm text-stone-600">
              or write to{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="font-medium text-stone-800 underline decoration-stone-400 underline-offset-4 hover:text-emerald-800 hover:decoration-emerald-700"
              >
                {supportEmail}
              </a>
            </p>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#E3D8BC] pt-6 text-sm text-stone-600 sm:flex-row lg:mt-16">
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-stone-900">Aspire Classes</span>
          </span>
          <span className="text-center sm:text-right">
            Independent preparation platform. Not affiliated with AMU.
          </span>
        </div>
      </div>
    </footer>
  );
}