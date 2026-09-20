import { Mail, ArrowUpRight } from "lucide-react";
export const metadata = {
  title: "Contact the Aspire team",
  description:
    "Get help with Aspire Classes test series, enrollment, and your preparation.",
  alternates: { canonical: "/contact" },
};
export default function Contact() {
  return (
    <main id="main" className="container section">
      <div className="page-heading">
        <span className="eyebrow">YOU DON’T HAVE TO FIGURE IT OUT ALONE</span>
        <h1>
          Let’s talk about
          <br />
          <em>your next step.</em>
        </h1>
        <p>
          Questions about a series, an account, or a tricky concept?
          <br />
          The Aspire team is an email away.
        </p>
      </div>
      <div className="two-grid">
        <a
          className="panel contact-card"
          href="mailto:aspireclasses51@gmail.com"
        >
          <Mail />
          <h2>Say hello.</h2>
          <p>aspireclasses51@gmail.com</p>
          <span className="text-link">
            Send an email <ArrowUpRight size={18} />
          </span>
        </a>
        <div className="panel">
          <span className="eyebrow">HELP US HELP YOU</span>
          <h2>A little context goes a long way.</h2>
          <p>
            Include your account email, exam name, and test title. For a subject
            doubt, include the question and what you have tried so far.
          </p>
          <p>Please never send a password or login code.</p>
        </div>
      </div>
    </main>
  );
}
