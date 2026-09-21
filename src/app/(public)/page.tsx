import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Target, Users, Clock, TrendingUp } from "lucide-react";
import { ExamCard } from "@/components/exam-card";
import { catalog } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 300;
export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const { exams } = await catalog();
  return <main id="main" className="heritage-home">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "EducationalOrganization",
      name: site.name, url: site.url, description: site.description, email: site.email,
    }).replace(/</g, "\\u003c") }} />
    <section id="home" className="heritage-hero">
      <div className="container heritage-hero-grid">
        <div>
          <span className="eyebrow">ASPIRE CLASSES · AMU CLASS 9 & 11</span>
          <h1>Unlock your potential.<br /><span>Conquer your entrance exam.</span></h1>
          <p>Focused practice, realistic mock tests, and clear results. Prepare for your next step with Aspire.</p>
          <div className="heritage-actions"><Link href="/register" className="button">Start your test series <ArrowUpRight size={18} /></Link><Link href="#test-series" className="button secondary">Explore series</Link></div>
          <div className="heritage-benefits"><span><Clock size={17} />Timed practice</span><span><TrendingUp size={17} />Track your progress</span></div>
        </div>
        <div className="heritage-illustration"><Image src="/legacy/certificate.svg" width={320} height={320} alt="Student celebrating an achievement" priority /></div>
      </div>
    </section>
    <section id="why-us" className="section container">
      <div className="heritage-heading"><span className="eyebrow">PREPARE WITH PURPOSE</span><h2>Why choose Aspire Classes?</h2><p>Practice that keeps you focused on the next exam.</p></div>
      <div className="heritage-grid">
        {[[Target, "Focused exam practice", "Prepare for AMU Class 9 and 11 with dedicated test series."], [BookOpen, "Learn by doing", "Build confidence with timed tests and topic-based practice."], [Users, "Support along the way", "Ask doubts and get help from the Aspire team."]].map(([Icon, title, copy]) => { const I = Icon as typeof Target; return <article className="heritage-card" key={String(title)}><I size={28} /><h3>{String(title)}</h3><p>{String(copy)}</p></article>; })}
      </div>
    </section>
    <section id="test-series" className="section heritage-tint">
      <div className="container"><div className="heritage-heading"><span className="eyebrow">YOUR NEXT GOAL</span><h2>Choose your test series</h2><p>Start with your exam. Practise at your pace.</p></div><div className="heritage-grid">{exams.map((exam, index) => <ExamCard key={exam.id} exam={exam} index={index} />)}</div></div>
    </section>
    <section id="features" className="section container heritage-learning">
      <Image src="/legacy/learning.svg" width={260} height={240} alt="Learning and preparing for an exam" />
      <div id="how-it-works"><span className="eyebrow">FOCUSED ON YOUR LEARNING</span><h2>A simple path to better preparation.</h2><ol className="heritage-steps"><li>Create your account.</li><li>Choose a test and practise.</li><li>Review your results and improve.</li></ol><Link className="text-link" href="/exams#free-practice">Try a free demo <ArrowUpRight size={17} /></Link></div>
    </section>
    <section id="faq" className="section container narrow">
      <div className="heritage-heading"><h2>Frequently asked questions</h2></div>
      <div className="heritage-faq">{[
        ["Can I practise on my phone?", "Yes. You can take tests and review results on a phone, tablet, or computer."],
        ["Can I try a test for free?", "Create your account and choose a published free demo from the exam catalog."],
        ["How do I get access after payment?", "Pay using the displayed QR code or UPI ID, then contact Aspire with your payment details. Staff verify payment and assign your tests."],
        ["What if I forget my password?", "Use Request password help on the login page. Aspire staff will review your request and help you recover access."],
      ].map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
    <section className="container heritage-cta"><div><h2>Ready for your next step?</h2><p>Your preparation starts here.</p></div><Link className="button" href="/register">Register now <ArrowUpRight size={18} /></Link></section>
  </main>;
}
