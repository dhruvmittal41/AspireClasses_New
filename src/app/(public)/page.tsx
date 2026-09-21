import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Target,
  Users,
  Clock,
  TrendingUp,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { ExamCard } from "@/components/exam-card";
import { catalog } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 300;
export const metadata = { alternates: { canonical: "/" } };

const steps = [
  { title: "Create your account", desc: "Get instant access to your personalized dashboard." },
  { title: "Choose a test & practise", desc: "Select from curated exam series and simulated tests." },
  { title: "Review results & improve", desc: "Analyze performance insights to sharpen your weaknesses." },
];

const features = [
  {
    icon: Target,
    title: "Focused exam practice",
    copy: "Prepare for AMU Class 9 and 11 with dedicated test series tailored to exam patterns.",
  },
  {
    icon: BookOpen,
    title: "Learn by doing",
    copy: "Build real exam confidence with timed tests and comprehensive topic-based practice.",
  },
  {
    icon: Users,
    title: "Support along the way",
    copy: "Ask doubts directly and get quick guidance and help from the expert Aspire team.",
  },
];

const faqs = [
  {
    q: "Can I practise on my phone?",
    a: "Yes. You can take tests and review results seamlessly on a phone, tablet, or computer.",
  },
  {
    q: "Can I try a test for free?",
    a: "Create your account and choose a published free demo directly from the exam catalog.",
  },
  {
    q: "How do I get access after payment?",
    a: "Pay using the displayed QR code or UPI ID, then contact Aspire with your payment details. Staff verify payment and assign your tests.",
  },
  {
    q: "What if I forget my password?",
    a: "Use Request password help on the login page. Aspire staff will review your request and help you recover access.",
  },
];

export default async function Home() {
  const { exams } = await catalog();

  return (
    <main id="main" className="heritage-home overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: site.name,
            url: site.url,
            description: site.description,
            email: site.email,
          }).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-b from-[#FBF6EA] via-[#F4EBD0]/40 to-[#FBF6EA] py-16 sm:py-24 lg:py-32 border-b border-[#E3D8BC]"
      >
        {/* Ambient Background Glows */}
        <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Centered Hero Content for Desktop */}
            <div className="lg:col-span-7 text-center lg:text-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              
              {/* Eyebrow Badge */}
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-4 py-1.5 rounded-full mb-6 border border-emerald-200/60 shadow-sm">
                <Sparkles size={14} className="text-emerald-700" />
                <span>Aspire Classes · AMU Class 9 & 11</span>
              </span>

              {/* Hero Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.12]">
                Unlock your potential. <br className="hidden sm:inline" />
                <span className="italic font-serif text-emerald-800 font-normal">
                  Conquer your entrance exam.
                </span>
              </h1>

              {/* Hero Description */}
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-stone-600 font-normal max-w-2xl mx-auto leading-relaxed">
                Focused practice, realistic mock tests, and clear results. Prepare for your next step with Aspire.
              </p>

              {/* Centered Action Buttons on Desktop */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-orange-300 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-900/30 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <span>Start your test series</span>
                  <ArrowUpRight
                    size={18}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  href="#test-series"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-stone-800 border border-[#E3D8BC] shadow-sm transition-all duration-300 hover:bg-[#FBF6EA] hover:border-emerald-800/40 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  Explore series
                </Link>
              </div>

              {/* Centered Feature Pills on Desktop */}
              <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-8 border-t border-[#E3D8BC]/60">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E3D8BC] shadow-xs">
                  <Clock size={16} className="text-emerald-800" />
                  <span>Timed practice</span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E3D8BC] shadow-xs">
                  <TrendingUp size={16} className="text-emerald-800" />
                  <span>Track your progress</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Illustration */}
            <div className="lg:col-span-5 flex justify-center animate-in fade-in slide-in-from-right-8 duration-1000 ease-out delay-200">
              <div className="relative group max-w-sm sm:max-w-md lg:max-w-none w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-3xl transform rotate-2 scale-105 transition-transform duration-300 group-hover:rotate-0" />
                <div className="relative rounded-3xl bg-white p-8 sm:p-12 border border-[#E3D8BC] shadow-xl shadow-stone-900/5 flex items-center justify-center">
                  <Image
                    src="/legacy/certificate.svg"
                    width={340}
                    height={340}
                    alt="Student celebrating an achievement"
                    priority
                    className="w-full h-auto max-h-[320px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="w-full bg-[#FBF6EA] py-16 sm:py-24 border-t border-[#E3D8BC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full mb-3 border border-emerald-200/60">
              Prepare with purpose
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Why choose <span className="italic font-serif text-emerald-800">Aspire Classes?</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-stone-600 font-normal">
              Practice that keeps you focused on conquering your next exam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, copy }, idx) => (
              <article
                key={title}
                className="group relative rounded-3xl bg-white p-8 border border-[#E3D8BC] shadow-md hover:shadow-2xl shadow-stone-900/5 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="absolute top-0 left-8 right-8 h-1 bg-transparent group-hover:bg-emerald-800 transition-colors duration-300 rounded-b-full" />

                <div>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FBF6EA] text-emerald-800 border border-[#E3D8BC]/80 group-hover:bg-emerald-800 group-hover:text-white transition-colors duration-300 mb-6 shadow-sm">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3 tracking-wide">
                    {title}
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
                    {copy}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Aspire Quality Standard</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modernized & Responsive Test Series Section */}
      <section
        id="test-series"
        className="w-full bg-gradient-to-b from-[#FBF6EA] via-[#F4EBD0]/50 to-[#FBF6EA] py-16 sm:py-20 lg:py-24 border-y border-[#E3D8BC]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full mb-3 border border-emerald-200/60">
              Your Next Goal
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Choose your <span className="italic font-serif text-emerald-800">test series</span>
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-stone-700 font-normal">
              Start with your exam. Practise at your pace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {exams.map((exam, index) => (
              <div
                key={exam.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ExamCard exam={exam as any} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Features Section */}
 <section
  id="features"
  className="w-full bg-gradient-to-b from-[#FBF6EA] to-[#F7EFCF] py-16 md:py-24 border-y border-[#E3D8BC]"
>
  <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
    
    {/* Left Column: Image Card stretched to match right column height */}
    <div className="lg:col-span-5 flex animate-in fade-in slide-in-from-left-8 duration-700">
      <div className="relative group w-full h-full min-h-[360px] lg:min-h-[440px] flex">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-600 to-amber-500 opacity-20 blur-2xl transition duration-500 group-hover:opacity-30" />
        <div className="relative w-full h-full rounded-3xl bg-white/60 backdrop-blur-sm p-8 border border-[#E3D8BC]/80 shadow-xl shadow-stone-900/5 flex items-center justify-center">
          <Image
            src="/legacy/learning.svg"
            width={320}
            height={320}
            alt="Learning and preparing for an exam"
            className="w-full h-full max-h-[380px] object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
      </div>
    </div>

    {/* Right Column: Content */}
    <div id="how-it-works" className="lg:col-span-7 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700">
      <span className="inline-block text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full w-fit mb-4 border border-emerald-200/60">
        Focused on your learning
      </span>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-8">
        A simple path to{" "}
        <span className="italic font-serif text-emerald-800 underline decoration-amber-500/80 decoration-2 underline-offset-8">
          better preparation.
        </span>
      </h2>

      <ol className="space-y-6 mb-10">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-4 sm:gap-5 group">
            <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-stone-900 text-white font-bold text-base shadow-md shadow-stone-900/10 group-hover:bg-emerald-800 transition-colors duration-200">
              {idx + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-lg sm:text-xl font-semibold text-stone-800 tracking-wide">
                {step.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base mt-0.5 italic font-light">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div>
        <Link
          href="/exams#free-practice"
          className="group inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-emerald-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <span>Try a free demo</span>
          <span className="italic text-amber-300 font-serif font-normal">now</span>
          <ArrowUpRight
            size={20}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>

  </div>
</section>

      {/* FAQ Section */}
      <section id="faq" className="w-full bg-[#FBF6EA] py-16 sm:py-20 border-t border-[#E3D8BC]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full mb-3 border border-emerald-200/60">
              <HelpCircle size={15} />
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
              Frequently asked <span className="italic font-serif text-emerald-800">questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map(({ q, a }, idx) => (
              <details
                key={q}
                className="group rounded-2xl bg-white border border-[#E3D8BC] p-5 sm:p-6 shadow-md hover:shadow-xl shadow-stone-900/5 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg sm:text-xl font-bold text-stone-900 group-open:text-emerald-800">
                  <span>{q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBF6EA] text-stone-700 transition-transform duration-300 group-open:rotate-180 group-open:bg-emerald-100 group-open:text-emerald-800">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-normal border-t border-stone-100 pt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Light Cream CTA Section */}
      <section className="w-full bg-[#FBF6EA] pb-20 pt-8 border-b border-[#E3D8BC]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#F4EBD0] p-8 sm:p-12 shadow-xl shadow-stone-900/5 border border-[#E3D8BC] flex flex-col md:flex-row items-center justify-between gap-8 animate-in zoom-in-95 fade-in duration-700">
            <div className="relative z-10 text-center md:text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/60 mb-1">
                <Sparkles size={14} /> Start Practising
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                Ready for your next step?
              </h2>
              <p className="text-stone-700 text-base sm:text-lg font-light italic">
                Your preparation starts right here.
              </p>
            </div>

            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <Link
                href="/register"
                className="group inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-orange-300 px-8 py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-600/30 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <span>Register now</span>
                <ArrowUpRight
                  size={20}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}