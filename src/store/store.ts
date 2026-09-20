import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Attempt } from "@/lib/types";
const catalogSlice = createSlice({
  name: "catalog",
  initialState: { query: "", exam: "all" },
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setExam(state, action: PayloadAction<string>) {
      state.exam = action.payload;
    },
  },
});
const attemptSlice = createSlice({
  name: "attempt",
  initialState: {
    current: null as Attempt | null,
    answers: {} as Record<string, string>,
    flagged: [] as number[],
    index: 0,
  },
  reducers: {
    resetAttempt(state) {
      state.current = null;
      state.answers = {};
      state.flagged = [];
      state.index = 0;
    },
    loadAttempt(state, action: PayloadAction<Attempt>) {
      state.current = action.payload;
      state.answers = action.payload.answers || {};
      state.flagged = [];
      state.index = 0;
    },
    answer(state, action: PayloadAction<{ id: number; value: string }>) {
      state.answers[action.payload.id] = action.payload.value;
    },
    clearAnswer(state, action: PayloadAction<number>) {
      delete state.answers[action.payload];
    },
    goTo(state, action: PayloadAction<number>) {
      state.index = Math.max(
        0,
        Math.min(action.payload, (state.current?.questions.length || 1) - 1),
      );
    },
    toggleFlag(state, action: PayloadAction<number>) {
      state.flagged = state.flagged.includes(action.payload)
        ? state.flagged.filter((id) => id !== action.payload)
        : [...state.flagged, action.payload];
    },
  },
});
export const { setQuery, setExam } = catalogSlice.actions;
export const {
  loadAttempt,
  resetAttempt,
  answer,
  clearAnswer,
  goTo,
  toggleFlag,
} = attemptSlice.actions;
export const makeStore = () =>
  configureStore({
    reducer: { catalog: catalogSlice.reducer, attempt: attemptSlice.reducer },
  });
export type Store = ReturnType<typeof makeStore>;
export type RootState = ReturnType<Store["getState"]>;
export type AppDispatch = Store["dispatch"];
