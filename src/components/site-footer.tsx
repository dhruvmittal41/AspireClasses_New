import Link from "next/link";
import { Brand } from "./brand";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand />
          <p>
            A little practice today.
            <br />A bigger possibility tomorrow.
          </p>
        </div>
        <div>
          <h3>Find your exam</h3>
          <Link href="/exams/amu-class-9">AMU Class 9</Link>
          <Link href="/exams/amu-class-11">AMU Class 11</Link>
          <Link href="/exams">All entrance exams</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/contact">Contact us</Link>
          <Link href="/dashboard">Student dashboard</Link>
          <a href="mailto:aspireclasses51@gmail.com">Email support</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Aspire Classes</span>
        <span>Independent preparation platform. Not affiliated with AMU.</span>
      </div>
    </footer>
  );
}
