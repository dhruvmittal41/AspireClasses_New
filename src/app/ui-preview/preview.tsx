"use client";
import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, loadAttempt } from "@/store/store";
import { TestPlayer } from "@/components/test-player";
import { Brand } from "@/components/brand";
import { AdminShell } from "@/components/admin-shell";
export function Preview({ endsAt }: { endsAt: string }) {
  const [mode, setMode] = useState("test");
  const [store] = useState(() => {
    const value = makeStore();
    value.dispatch(loadAttempt({ id: "ui-preview-only", test_id: 99999999, ends_at: endsAt, answers: { 1: "b", 3: "a", 5: "c" }, questions: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, question_text: i === 0 ? "A train travels 180 km in 3 hours. What is its average speed?" : "Which of the following represents the correct answer to question " + (i + 1) + "?", marks: 2, image_url: null, options: { a: "40 km/h", b: "60 km/h", c: "80 km/h", d: "90 km/h" } })) }));
    return value;
  });
  return <><button className="button small" onClick={() => setMode(mode === "test" ? "admin" : "test")}>Switch preview</button>{mode === "test" ? <Provider store={store}><main id="main" className="container section test-page"><div className="test-page-header"><Brand /><span className="test-page-label">Focus. Practise. Improve.</span></div><TestPlayer test={{ id: 99999999, exam_id: "preview", test_name: "AMU Class 9 · Mathematics", duration_minutes: 60, subject_topic: "Mathematics", instructions: "", test_category: "demo", date_scheduled: null, published: true }} /></main></Provider> : <AdminShell><div className="admin-overview"><div className="workspace-intro"><div><h2>A clear view of your classroom</h2><p>Keep your tests ready and your students moving forward.</p></div><button className="button">Manage tests →</button></div><div className="admin-metrics">{["Accounts", "Tests", "Questions", "Completed attempts"].map((label, i) => <div className="panel admin-metric" key={label}><strong>{[128, 24, 360, 842][i]}</strong><span>{label}</span></div>)}</div><section className="panel"><div className="workspace-intro"><div><h2>Recent tests</h2><p>Your latest drafts and published tests.</p></div></div><div className="admin-records">{["AMU Class 9 · Mathematics", "AMU Class 11 · Physics", "Science revision practice"].map((name, i) => <div className="admin-record" key={name}><div><strong>{name}</strong><span>30 questions · 60 min</span></div><span className={"status-pill " + (i ? "is-published" : "")}>{i ? "Published" : "Draft"}</span><a className="text-link" href="#">Questions →</a></div>)}</div></section><section className="panel"><h2>Edit a question</h2><form className="form-grid"><fieldset className="admin-form-fields"><label className="span-two">Question text<textarea defaultValue="A train travels 180 km in 3 hours. What is its average speed?" rows={3} /></label>{["A", "B", "C", "D"].map(label => <label key={label}>Option {label}<input placeholder="Answer option" /></label>)}</fieldset><div className="form-bottom"><button className="button">Save changes</button></div></form></section></div></AdminShell>}</>;
}
