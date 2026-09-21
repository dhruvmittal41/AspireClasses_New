export type Answers = Record<string, string>;
export type SaveState = "saved" | "saving" | "error";
const signature = (answers: Answers) => JSON.stringify(Object.entries(answers).sort(([a], [b]) => a.localeCompare(b)));

// One request at a time. Intermediate edits are coalesced; only the newest
// snapshot is sent next, so slow connections cannot build an unbounded queue.
export function createAnswerSync(initial: Answers | null, save: (answers: Answers) => Promise<unknown>, onState: (state: SaveState) => void) {
  let latest = { ...initial };
  let saved = initial === null ? null : signature(initial);
  let active: Promise<void> | null = null;
  let stopped = false;
  const flush = (): Promise<void> => {
    if (active) return active;
    if (stopped || signature(latest) === saved) return Promise.resolve();
    onState("saving");
    active = (async () => {
      while (!stopped && signature(latest) !== saved) {
        const snapshot = { ...latest };
        const version = signature(snapshot);
        try {
          await save(snapshot);
          saved = version;
        } catch {
          if (!stopped) onState("error");
          return;
        }
      }
      if (!stopped) onState("saved");
    })().finally(() => { active = null; });
    return active;
  };
  return {
    update(answers: Answers) {
      latest = { ...answers };
      if (!stopped) onState(signature(latest) === saved && !active ? "saved" : "saving");
    },
    flush,
    stop() { stopped = true; return active || Promise.resolve(); },
  };
}
