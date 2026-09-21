import test from "node:test";
import assert from "node:assert/strict";
import { createAnswerSync } from "../src/lib/answer-sync.ts";
import { readAttemptDraft } from "../src/lib/attempt-draft.ts";

test("slow saves serialize requests, skip intermediate snapshots, and acknowledge only the latest", async () => {
  const sent = [], states = [], releases = [];
  const sync = createAnswerSync({}, value => { sent.push(value); return new Promise(resolve => releases.push(resolve)); }, state => states.push(state));
  sync.update({ 1: "a" });
  const done = sync.flush();
  sync.update({ 1: "b" });
  sync.update({ 1: "c", 2: "a" });
  releases.shift()();
  await Promise.resolve();
  assert.deepEqual(sent, [{ 1: "a" }, { 1: "c", 2: "a" }]);
  assert.equal(states.includes("saved"), false);
  releases.shift()();
  await done;
  assert.equal(states.at(-1), "saved");
});

test("failed saves retry the newest answers; stop prevents later writes", async () => {
  let fail = true;
  const sent = [], states = [];
  const sync = createAnswerSync({}, async value => { if (fail) throw new Error("offline"); sent.push(value); }, state => states.push(state));
  sync.update({ 1: "a" });
  await sync.flush();
  assert.equal(states.at(-1), "error");
  sync.update({ 1: "b" });
  fail = false;
  await sync.flush();
  assert.deepEqual(sent, [{ 1: "b" }]);
  await sync.stop();
  sync.update({ 1: "c" });
  await sync.flush();
  assert.equal(sent.length, 1);
});

test("an uncertain save can retry an empty answer set", async () => {
  const sent = [];
  const sync = createAnswerSync(null, async value => sent.push(value), () => {});
  sync.update({});
  await sync.flush();
  assert.deepEqual(sent, [{}]);
});

test("draft recovery validates answers and cannot override server answers after expiry", () => {
  const attempt = { id: "attempt", test_id: 1, answers: { 1: "a" }, ends_at: new Date(Date.now() + 60000).toISOString(), questions: [{ id: 1, options: { a: "A", b: "B" } }, { id: 2, options: { a: "A" } }] };
  const raw = JSON.stringify({ id: "attempt", answers: { 1: "b", 2: "invalid", 99: "a" }, flagged: [1, 99], index: 100 });
  assert.deepEqual(readAttemptDraft(raw, attempt), { answers: { 1: "b" }, flagged: [1], index: 1 });
  assert.deepEqual(readAttemptDraft(raw, { ...attempt, ends_at: new Date(0).toISOString() }).answers, { 1: "a" });
  assert.equal(readAttemptDraft("invalid", attempt), null);
  assert.equal(readAttemptDraft(raw, { ...attempt, id: "different" }), null);
});
