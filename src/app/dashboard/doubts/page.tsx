export const metadata = { title: "Ask a doubt" };
export default function Doubts() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">CURIOSITY IS PROGRESS</span>
        <h1>Stuck on something?</h1>
        <p>A good question is the beginning of understanding.</p>
      </div>
      <div className="panel narrow">
        <h2>Let’s work through it.</h2>
        <p>
          Email the Aspire team with your test name, question, and the part
          you’re unsure about. Include what you have tried so we can give you
          useful guidance.
        </p>
        <a
          className="button"
          href="mailto:aspireclasses51@gmail.com?subject=Help%20with%20a%20practice%20question"
        >
          Ask your question ↗
        </a>
      </div>
    </>
  );
}
