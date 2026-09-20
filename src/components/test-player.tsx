"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { MathText } from "./math-text";
import { useRouter } from "next/navigation";
import { Clock3, Flag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  loadAttempt,
  resetAttempt,
  answer,
  clearAnswer,
  goTo,
  toggleFlag,
  type RootState,
} from "@/store/store";
import type { Test, Attempt } from "@/lib/types";
async function request(body: object) {
  const response = await fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(json.error || "Connection interrupted. Please retry.");
  return json.data;
}
export function TestPlayer({ test }: { test: Test }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { current, answers, flagged, index } = useSelector(
    (s: RootState) => s.attempt,
  );
  const attempt = current?.test_id === test.id ? current : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const submitting = useRef(false);
  const attemptedAuto = useRef(false);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  async function start() {
    setBusy(true);
    setError("");
    try {
      const value: Attempt = await request({
        action: "start",
        testId: test.id,
      });
      attemptedAuto.current = false;
      dispatch(loadAttempt(value));
      setSaved("Saved answers restored");
      setRemaining(
        Math.max(0, Math.ceil((Date.parse(value.ends_at) - Date.now()) / 1000)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setBusy(false);
    }
  }
  const submit = useCallback(async () => {
    if (!attempt || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await saveQueue.current.catch(() => {});
      const id = await request({
        action: "submit",
        attemptId: attempt.id,
        answers: answersRef.current,
      });
      dispatch(resetAttempt());
      router.replace("/dashboard/results#" + id);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not submit. Retry below.",
      );
      submitting.current = false;
      setBusy(false);
    }
  }, [attempt, router, dispatch]);
  useEffect(() => {
    if (!attempt) return;
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil((Date.parse(attempt.ends_at) - Date.now()) / 1000),
        ),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attempt]);
  useEffect(() => {
    if (attempt && remaining === 0 && !attemptedAuto.current) {
      attemptedAuto.current = true;
      void submit();
    }
  }, [remaining, attempt, submit]);
  useEffect(() => {
    if (!attempt) return;
    const id = attempt.id;
    const timer = setTimeout(() => {
      if (submitting.current || Date.now() >= Date.parse(attempt.ends_at))
        return;
      setSaved("Saving answers…");
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => request({ action: "save", attemptId: id, answers }))
        .then(() => setSaved("All answers saved"))
        .catch(() =>
          setSaved(
            "Not saved — check your connection. Your answers will retry.",
          ),
        );
    }, 250);
    return () => clearTimeout(timer);
  }, [answers, attempt]);
  useEffect(() => {
    if (!attempt) return;
    const interval = setInterval(() => {
      if (submitting.current || Date.now() >= Date.parse(attempt.ends_at))
        return;
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() =>
          request({
            action: "save",
            attemptId: attempt.id,
            answers: answersRef.current,
          }),
        )
        .then(() => setSaved("All answers saved"))
        .catch(() => setSaved("Not saved — check your connection."));
    }, 10000);
    return () => clearInterval(interval);
  }, [attempt]);
  useEffect(() => {
    if (!attempt) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!submitting.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [attempt]);
  if (!attempt)
    return (
      <div className="panel test-overview">
        <span className="badge">
          {test.test_category === "demo" ? "Free practice" : "Practice test"}
        </span>
        <h1>{test.test_name}</h1>
        <p>{test.subject_topic}</p>
        <div className="notice">
          <Clock3 size={18} /> {test.duration_minutes} minutes · Your timer
          continues if you leave this page.
        </div>
        <h2>Before you begin</h2>
        <p className="preserve-lines">
          {test.instructions ||
            "Choose one answer for each question. You can move between questions and flag any you would like to review."}
        </p>
        <ul className="feature-list">
          <li>
            Each question displays its marks. Incorrect and unanswered questions
            receive zero marks.
          </li>
          <li>Keep an internet connection. Answers are saved as you work.</li>
          <li>
            After time runs out, only answers saved before the deadline count.
          </li>
          <li>Returning to this test resumes your existing attempt.</li>
        </ul>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <button className="button" onClick={start} disabled={busy}>
          {busy ? "Preparing your test…" : "Start or resume test →"}
        </button>
      </div>
    );
  const q = attempt.questions[index];
  const ended = remaining === 0;
  return (
    <>
      <div className="test-topbar">
        <div>
          <span className="eyebrow">STAY CURIOUS. STAY FOCUSED.</span>
          <h1>{test.test_name}</h1>
        </div>
        <div className={"timer " + ((remaining || 0) < 60 ? "urgent" : "")}>
          <Clock3 size={20} />
          {remaining === null
            ? "--:--"
            : `${Math.floor(remaining / 60)
                .toString()
                .padStart(
                  2,
                  "0",
                )}:${(remaining % 60).toString().padStart(2, "0")}`}
        </div>
      </div>
      <p className="save-status" role="status">
        {saved}
      </p>
      {error && (
        <div role="alert" className="error-message">
          {error}{" "}
          <button className="text-button" onClick={() => void submit()}>
            Retry submission
          </button>
        </div>
      )}
      <div className="test-workspace">
        <section className="panel question-panel">
          <div className="question-meta">
            <span>
              QUESTION {index + 1} OF {attempt.questions.length}
            </span>
            <span>
              {q.marks} mark{q.marks === 1 ? "" : "s"}
            </span>
          </div>
          <h2 className="preserve-lines">
            <MathText text={q.question_text} />
          </h2>
          {q.image_url && (
            <Image
              className="question-image"
              src={q.image_url}
              alt="Illustration for this question"
              width={700}
              height={400}
              unoptimized
            />
          )}
          <fieldset disabled={ended || busy}>
            <legend className="sr-only">Choose an answer</legend>
            {Object.entries(q.options).map(([key, value]) => (
              <label
                className={
                  "answer-option " + (answers[q.id] === key ? "selected" : "")
                }
                key={key}
              >
                <input
                  type="radio"
                  name={"question-" + q.id}
                  value={key}
                  checked={answers[q.id] === key}
                  onChange={() => dispatch(answer({ id: q.id, value: key }))}
                />
                <span className="option-letter">{key.toUpperCase()}</span>
                <span className="preserve-lines">
                  <MathText text={value} />
                </span>
                {answers[q.id] === key && <Check size={18} />}
              </label>
            ))}
          </fieldset>
          <div className="question-actions">
            <button
              className="text-button"
              disabled={ended || busy}
              onClick={() => dispatch(clearAnswer(q.id))}
            >
              Clear answer
            </button>
            <button
              className={
                "text-button " + (flagged.includes(q.id) ? "flagged" : "")
              }
              disabled={ended || busy}
              onClick={() => dispatch(toggleFlag(q.id))}
            >
              <Flag size={16} />
              {flagged.includes(q.id) ? "Marked for review" : "Mark for review"}
            </button>
          </div>
          <div className="question-navigation">
            <button
              className="button secondary"
              disabled={index === 0}
              onClick={() => dispatch(goTo(index - 1))}
            >
              <ChevronLeft size={17} />
              Previous
            </button>
            <button
              className="button"
              disabled={index === attempt.questions.length - 1}
              onClick={() => dispatch(goTo(index + 1))}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
        <aside className="panel question-map">
          <h2>Your progress</h2>
          <p>
            {Object.keys(answers).length} of {attempt.questions.length} answered
          </p>
          <div className="question-grid">
            {attempt.questions.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Question ${i + 1}${answers[item.id] ? ", answered" : ""}${flagged.includes(item.id) ? ", marked for review" : ""}`}
                aria-current={index === i ? "step" : undefined}
                className={`${answers[item.id] ? "answered" : ""} ${flagged.includes(item.id) ? "flagged" : ""} ${index === i ? "current" : ""}`}
                onClick={() => dispatch(goTo(i))}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="fine-print">
            Blue: answered · Amber: review
            <br />
            Outline: current question
          </p>
          <button
            className="button full"
            onClick={() => setConfirm(true)}
            disabled={busy}
          >
            {busy ? "Submitting…" : "Finish test"}
          </button>
          {confirm && (
            <div className="submit-confirm">
              <p>
                {attempt.questions.length - Object.keys(answers).length}{" "}
                unanswered. Submit your attempt?
              </p>
              <button
                className="button full"
                disabled={busy}
                onClick={() => void submit()}
              >
                Yes, submit
              </button>
              <button className="text-button" onClick={() => setConfirm(false)}>
                Keep practising
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
