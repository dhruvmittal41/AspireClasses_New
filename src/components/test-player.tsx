"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { MathText } from "./math-text";
import { useRouter } from "next/navigation";
import { Clock3, Flag, ChevronLeft, ChevronRight, Check, CircleCheck, CloudOff, LoaderCircle, ListChecks, X } from "lucide-react";
import { loadAttempt, restoreProgress, resetAttempt, answer, clearAnswer, goTo, toggleFlag, type RootState } from "@/store/store";
import { createAnswerSync, type SaveState } from "@/lib/answer-sync";
import { readAttemptDraft } from "@/lib/attempt-draft";
import type { Test, Attempt } from "@/lib/types";

async function request(body: object) {
  let response: Response;
  try {
    response = await fetch("/api/attempts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("Connection interrupted. Your answers are still here. Please retry.");
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || "Could not save your test. Please retry.");
  return json.data;
}
const draftKey = (id: string) => "aspire-attempt:" + id;

export function TestPlayer({ test }: { test: Test }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { current, answers, flagged, index } = useSelector((s: RootState) => s.attempt);
  const attempt = current?.test_id === test.id ? current : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<"submit" | "leave" | null>(null);
  const [filter, setFilter] = useState("all");
  const [localUnavailable, setLocalUnavailable] = useState(false);
  const submitting = useRef(false);
  const attemptedAuto = useRef(false);
  const sync = useRef<ReturnType<typeof createAnswerSync> | null>(null);
  const answersRef = useRef(answers);
  const dialog = useRef<HTMLDialogElement>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const value: Attempt = await request({ action: "start", testId: test.id });
      if (!value?.questions?.length) throw new Error("This test has no available questions. Please contact Aspire support.");
      attemptedAuto.current = false;
      submitting.current = false;
      dispatch(loadAttempt(value));
      try {
        const draft = readAttemptDraft(sessionStorage.getItem(draftKey(value.id)), value);
        if (draft) dispatch(restoreProgress(draft));
      } catch { setLocalUnavailable(true); }
      setRemaining(Math.max(0, Math.ceil((Date.parse(value.ends_at) - Date.now()) / 1000)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start your test.");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (!attempt) return;
    const saver = createAnswerSync(attempt.answers, snapshot =>
      request({ action: "save", attemptId: attempt.id, answers: snapshot }), setSaveState);
    sync.current = saver;
    return () => { void sync.current?.stop(); sync.current = null; };
  }, [attempt]);

  useEffect(() => {
    if (!attempt || submitting.current) return;
    sync.current?.update(answers);
    const timer = setTimeout(() => {
      if (Date.now() < Date.parse(attempt.ends_at)) void sync.current?.flush();
    }, 300);
    try {
      sessionStorage.setItem(draftKey(attempt.id), JSON.stringify({ id: attempt.id, answers, flagged, index }));
    } catch {
      // Storage availability is external state; report after this effect settles.
      queueMicrotask(() => setLocalUnavailable(true));
    }
    return () => clearTimeout(timer);
  }, [attempt, answers, flagged, index]);

  useEffect(() => {
    if (!attempt) return;
    const retry = () => {
      if (!submitting.current && Date.now() < Date.parse(attempt.ends_at)) void sync.current?.flush();
    };
    const interval = setInterval(retry, 5000);
    window.addEventListener("online", retry);
    return () => { clearInterval(interval); window.removeEventListener("online", retry); };
  }, [attempt]);

  const submit = useCallback(async () => {
    if (!attempt || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setConfirm(null);
    setError("");
    try {
      // Stop queued saves before submission; the server receives the latest
      // complete snapshot and remains authoritative about the deadline.
      await sync.current?.stop();
      const id = await request({ action: "submit", attemptId: attempt.id, answers: answersRef.current });
      if (typeof id !== "string") throw new Error("Submission could not be confirmed. Please retry.");
      try { sessionStorage.removeItem(draftKey(attempt.id)); } catch {}
      dispatch(resetAttempt());
      router.replace("/dashboard/results#" + id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit. Please retry.");
      submitting.current = false;
      setBusy(false);
      // Restart saves when a manual submission fails before the deadline.
      const saver = createAnswerSync(null, snapshot =>
        request({ action: "save", attemptId: attempt.id, answers: snapshot }), setSaveState);
      saver.update(answersRef.current);
      sync.current = saver;
    }
  }, [attempt, router, dispatch]);

  useEffect(() => {
    if (!attempt) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((Date.parse(attempt.ends_at) - Date.now()) / 1000)));
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
    const warn = (event: BeforeUnloadEvent) => {
      if (!submitting.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [attempt]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);

  if (!attempt) return <section className="panel test-overview">
    <span className="badge">{test.test_category === "demo" ? "Free practice" : "Practice test"}</span>
    <h1>{test.test_name}</h1><p>{test.subject_topic}</p>
    <div className="test-instructions-stats"><span><Clock3 size={21} /><strong>{test.duration_minutes} minutes</strong>Timed practice</span><span><ListChecks size={21} /><strong>One answer per question</strong>No negative marking</span></div>
    <h2>Before you begin</h2>
    <p className="preserve-lines">{test.instructions || "Choose one answer for each question. Move between questions freely and mark any you want to review."}</p>
    <ul className="feature-list"><li>Answers save automatically. Keep an internet connection.</li><li>The timer keeps running if you leave. You can resume this attempt.</li><li>When time ends, only answers saved to the server before the deadline count.</li></ul>
    {error && <p role="alert" className="error-message">{error}</p>}
    <div className="test-start-actions"><button className="button" onClick={start} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Preparing your test…</> : "Start or resume test →"}</button><Link href="/dashboard/my-tests" className="text-link">Back to my tests</Link></div>
  </section>;

  const q = attempt.questions[index];
  const ended = remaining === 0;
  const answered = attempt.questions.filter(item => answers[item.id]).length;
  const unanswered = attempt.questions.length - answered;
  const review = attempt.questions.filter(item => flagged.includes(item.id)).length;
  const navigate = (next: number) => {
    dispatch(goTo(next));
    requestAnimationFrame(() => {
      questionHeading.current?.focus({ preventScroll: true });
      questionHeading.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
    });
  };
  const visibleQuestions = attempt.questions.map((item, i) => ({ item, i })).filter(({ item }) =>
    filter === "unanswered" ? !answers[item.id] : filter === "flagged" ? flagged.includes(item.id) : true);
  const saveCopy = saveState === "saved" ? "All answers saved" : saveState === "saving" ? "Saving your answers…" : "Answers not synced. Reconnecting…";
  const SaveIcon = saveState === "saved" ? CircleCheck : saveState === "saving" ? LoaderCircle : CloudOff;

  return <div className="attempt-room">
    <header className="test-topbar"><div><span className="eyebrow">PRACTICE ROOM</span><h1>{test.test_name}</h1></div>
      <div className={"timer " + (remaining !== null && remaining < 300 ? "urgent" : "")} role="timer" aria-label="Time remaining"><Clock3 size={20} /><div><small>Time left</small><strong>{remaining === null ? "--:--" : Math.floor(remaining / 60).toString().padStart(2, "0") + ":" + (remaining % 60).toString().padStart(2, "0")}</strong></div></div>
    </header>
    <div className="attempt-status"><p role="status" className={"save-status " + saveState}><SaveIcon size={17} className={saveState === "saving" ? "spin" : ""} />{saveCopy}</p><button className="text-button" onClick={() => setConfirm("leave")} disabled={busy}>Save & leave</button></div>
    {localUnavailable && <p className="notice">Browser recovery is unavailable. Keep this page open until your answers are saved.</p>}
    {error && <div role="alert" className="error-message">{error} <button className="text-button" disabled={busy} onClick={() => void submit()}>Retry submission</button></div>}
    {ended && <p className="notice" role="status">{busy ? "Time is up. Submitting your saved answers…" : "Time is up. Your answers are locked. Retry submission if needed."}</p>}
    <div className="test-workspace">
      <section className="panel question-panel" aria-label="Current question">
        <div className="question-meta"><span>Question {index + 1} <span className="muted">of {attempt.questions.length}</span></span><span className="badge">{q.marks} mark{q.marks === 1 ? "" : "s"}</span></div>
        <h2 className="preserve-lines" ref={questionHeading} tabIndex={-1}><MathText text={q.question_text} /></h2>
        {q.image_url && <Image className="question-image" src={q.image_url} alt="Illustration for this question" width={700} height={400} unoptimized />}
        <fieldset disabled={ended || busy}><legend className="sr-only">Choose one answer</legend>{Object.entries(q.options).map(([key, value]) => <label className={"answer-option " + (answers[q.id] === key ? "selected" : "")} key={key}>
          <input type="radio" name={"question-" + q.id} value={key} checked={answers[q.id] === key} onChange={() => dispatch(answer({ id: q.id, value: key }))} />
          <span className="option-letter">{key.toUpperCase()}</span><span className="option-copy preserve-lines"><MathText text={value} /></span>{answers[q.id] === key && <Check size={18} aria-hidden="true" />}
        </label>)}</fieldset>
        <div className="question-actions"><button className="text-button" disabled={ended || busy || !answers[q.id]} onClick={() => dispatch(clearAnswer(q.id))}>Clear answer</button><button className={"text-button " + (flagged.includes(q.id) ? "flagged" : "")} aria-pressed={flagged.includes(q.id)} disabled={ended || busy} onClick={() => dispatch(toggleFlag(q.id))}><Flag size={16} />{flagged.includes(q.id) ? "Marked for review" : "Mark for review"}</button></div>
        <div className="question-navigation"><button className="button secondary" disabled={index === 0 || busy} onClick={() => navigate(index - 1)}><ChevronLeft size={17} />Previous</button>{index < attempt.questions.length - 1 ? <button className="button" disabled={busy} onClick={() => navigate(index + 1)}>Next question<ChevronRight size={17} /></button> : <button className="button" disabled={busy} onClick={() => setConfirm("submit")}>Review & finish<Check size={17} /></button>}</div>
      </section>
      <aside className="panel question-map" aria-label="Test progress">
        <h2>Your progress</h2><p className="progress-caption"><strong>{answered}</strong> / {attempt.questions.length} answered</p>
        <progress value={answered} max={attempt.questions.length} aria-label="Questions answered" />
        <div className="attempt-counts"><span><strong>{unanswered}</strong>Unanswered</span><span><strong>{review}</strong>For review</span></div>
        <label className="map-filter">Show questions<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All questions</option><option value="unanswered">Unanswered ({unanswered})</option><option value="flagged">Marked for review ({review})</option></select></label>
        <div className="question-grid">{visibleQuestions.map(({ item, i }) => <button key={item.id} disabled={busy} aria-label={"Question " + (i + 1) + (answers[item.id] ? ", answered" : ", unanswered") + (flagged.includes(item.id) ? ", marked for review" : "")} aria-current={index === i ? "step" : undefined} className={(answers[item.id] ? "answered " : "") + (flagged.includes(item.id) ? "flagged " : "") + (index === i ? "current" : "")} onClick={() => navigate(i)}>{i + 1}{flagged.includes(item.id) && <Flag size={10} aria-hidden="true" />}</button>)}</div>
        {!visibleQuestions.length && <p className="map-empty">No questions in this view.</p>}
        <div className="map-legend"><span><i className="answered" />Answered</span><span><Flag size={12} />For review</span><span><i className="current" />Current</span></div>
        <button className="button full" onClick={() => setConfirm("submit")} disabled={busy}>{busy ? "Submitting…" : "Finish test"}</button>
      </aside>
    </div>
    <dialog className="attempt-dialog" ref={dialog} onCancel={() => setConfirm(null)} aria-labelledby="attempt-dialog-title">
      <button className="dialog-close icon-button" aria-label="Close" onClick={() => setConfirm(null)}><X size={22} /></button>
      <span className="badge">{confirm === "leave" ? "Pause your practice" : "One last check"}</span>
      <h2 id="attempt-dialog-title">{confirm === "leave" ? "Leave this test?" : "Ready to submit?"}</h2>
      <div className="submission-summary"><span><strong>{answered}</strong>Answered</span><span><strong>{unanswered}</strong>Unanswered</span><span><strong>{review}</strong>For review</span></div>
      <p>{confirm === "leave" ? "We’ll try to save your answers before leaving. Your timer keeps running. Return to this test to resume." : unanswered ? "You still have unanswered questions. You can go back to review them or submit now." : "You’ve answered every question. Once submitted, this attempt can’t be changed."}</p>
      <div className="dialog-actions"><button className="button secondary" onClick={() => setConfirm(null)} autoFocus>Keep working</button><button className="button" disabled={busy} onClick={async () => {
        if (confirm === "submit") { void submit(); return; }
        setBusy(true);
        await sync.current?.flush();
        setConfirm(null);
        router.push("/dashboard/my-tests");
      }}>{confirm === "leave" ? "Save & leave" : "Submit test"}</button></div>
    </dialog>
  </div>;
}
