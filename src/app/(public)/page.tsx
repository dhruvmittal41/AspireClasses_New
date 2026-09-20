import { Logo } from "@/components/brand";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Target,
  Clock3,
  ChartNoAxesCombined,
  Sparkles,
} from "lucide-react";
import { ExamCard } from "@/components/exam-card";
import { catalog } from "@/lib/data";
import { site } from "@/lib/site";
export const revalidate = 300;
export const metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const { exams } = await catalog();
  return (
    <main id="main">
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
          }).replace(/</g, "\u003c"),
        }}
      />
      <section className="hero container">
        <div className="hero-copy">
          <span className="pill">
            <span className="status-dot" /> BIG DREAMS. SMALL, CONSISTENT STEPS.
          </span>
          <h1>
            Your next chapter
            <br />
            starts with <em>practice.</em>
          </h1>
          <p>
            From your first mock test to your entrance exam.
            <br className="desktop-break" /> Prepare for AMU Class 9 & 11 with a
            little more clarity,
            <br className="desktop-break" /> a lot more confidence, and a plan
            that works for you.
          </p>
          <div className="hero-actions">
            <Link href="/exams" className="button">
              Find your test series <ArrowUpRight size={19} />
            </Link>
            <Link href="/exams#free-practice" className="text-link">
              Explore free practice <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-benefits">
            <span>
              <Check size={16} /> Practice at your pace
            </span>
            <span>
              <Check size={16} /> Know where you stand
            </span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Practice, review, improve: your preparation journey"
        >
          <div className="art-grid" />
          <span className="art-star">✳</span>
          <div className="art-label">YOUR FUTURE IS A WORK IN PROGRESS</div>
          <div className="practice-sheet">
            <div className="sheet-header">
              <Logo />
              <span>ONE STEP CLOSER</span>
              <span>01 / 03</span>
            </div>
            <h2>
              Ready. Set.
              <br />
              <em>Aspire.</em>
            </h2>
            <div className="sheet-rule" />
            <div className="sheet-task">
              <span className="task-check">
                <Check size={15} />
              </span>{" "}
              Show up for your goals
            </div>
            <div className="sheet-task">
              <span className="task-check">
                <Check size={15} />
              </span>{" "}
              Learn from every attempt
            </div>
            <div className="sheet-task">
              <span className="task-empty" /> Make your next move
            </div>
            <div className="sheet-bottom">
              A LITTLE BETTER, EVERY DAY <ArrowUpRight size={29} />
            </div>
          </div>
          <div className="floating-note">
            <span>
              <Sparkles size={20} />
            </span>
            <div>
              Progress over perfection.<small>You’ve got this.</small>
            </div>
          </div>
          <div className="orbit-label">PRACTISE · REFLECT · GROW</div>
        </div>
      </section>
      <div className="feature-strip">
        <div className="container">
          <span>
            <Target /> Focused entrance practice
          </span>
          <span>
            <Clock3 /> Real exam experience
          </span>
          <span>
            <ChartNoAxesCombined /> Insights after every test
          </span>
          <span>
            <BookIcon /> Room to grow
          </span>
        </div>
      </div>
      <section className="section container" id="exams">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR STARTING LINE</span>
            <h2>One ambition. Many possibilities.</h2>
            <p>Choose your entrance exam. We’ll help you take the next step.</p>
          </div>
          <Link href="/exams" className="text-link">
            View all exams <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="exam-grid">
          {exams.slice(0, 4).map((exam, index) => (
            <ExamCard key={exam.id} exam={exam} index={index} />
          ))}
        </div>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LESS GUESSWORK. MORE PROGRESS.</span>
              <h2>Build confidence, one test at a time.</h2>
            </div>
            <p>
              A simple routine that turns
              <br />
              effort into understanding.
            </p>
          </div>
          <div className="steps-grid">
            {[
              [
                "01",
                "Find your focus",
                "Choose your exam and a test that meets you where you are.",
              ],
              [
                "02",
                "Make it feel real",
                "Practise with a timer, navigate questions, and flag the ones to revisit.",
              ],
              [
                "03",
                "Learn. Adjust. Repeat.",
                "See your score, track your attempts, and decide what to revise next.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section container faq-section">
        <div>
          <span className="eyebrow">A LITTLE CLARITY</span>
          <h2>Before you get started.</h2>
          <p>
            Still have a question?
            <br />
            <Link href="/contact" className="text-link">
              We’re here to help <ArrowUpRight size={17} />
            </Link>
          </p>
        </div>
        <div className="faq-list">
          {[
            [
              "Who is Aspire Classes for?",
              "Students preparing for AMU Class 9 and Class 11 entrance exams. More entrance exam collections will be added as they become available.",
            ],
            [
              "Can I try a test before enrolling?",
              "Yes. Published demo tests are available to signed-in students without a paid assignment. Visit the exam catalog to see the current selection.",
            ],
            [
              "Can I practise on my phone?",
              "Yes. The test interface works on phones, tablets, and computers. Keep a stable internet connection so your answers can be saved before the timer ends.",
            ],
            [
              "How do I access a paid test series?",
              "Choose an available bundle to see the payment QR and UPI ID. The Aspire team manages test access, and assigned tests appear in your dashboard.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="cta-panel">
          <div>
            <span className="eyebrow">YOUR AMBITION DESERVES A START</span>
            <h2>Let’s make the next step count.</h2>
            <p>You bring the curiosity. We’ll bring the practice.</p>
          </div>
          <Link href="/register" className="button light">
            Start your journey <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}
function BookIcon() {
  return (
    <span className="book-symbol" aria-hidden="true">
      ↗
    </span>
  );
}
