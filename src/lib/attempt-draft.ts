import type { Attempt } from "./types";

export function readAttemptDraft(raw: string | null, attempt: Attempt) {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || value.id !== attempt.id) return null;
    const questions = attempt.questions;
    const answers = { ...attempt.answers };
    // Local answers are recoverable only while the server deadline is open.
    // Once expired, only the server's saved answers are eligible for scoring.
    if (Date.now() < Date.parse(attempt.ends_at) && value.answers && typeof value.answers === "object" && !Array.isArray(value.answers)) {
      for (const q of questions) {
        delete answers[q.id];
        const selected = value.answers[q.id];
        if (typeof selected === "string" && Object.hasOwn(q.options, selected)) answers[q.id] = selected;
      }
    }
    const flagged = Array.isArray(value.flagged) ? questions.filter(q => value.flagged.includes(q.id)).map(q => q.id) : [];
    const index = Number.isSafeInteger(value.index) ? Math.max(0, Math.min(value.index, questions.length - 1)) : 0;
    return { answers, flagged, index };
  } catch { return null; }
}
