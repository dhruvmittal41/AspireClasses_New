import { z } from "zod";
export const answerSchema = z.record(
  z.string().regex(/^\d+$/),
  z.enum(["a", "b", "c", "d"]),
);
export const attemptInput = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), testId: z.number().int().positive() }),
  z.object({
    action: z.literal("save"),
    attemptId: z.uuid(),
    answers: answerSchema,
  }),
  z.object({
    action: z.literal("submit"),
    attemptId: z.uuid(),
    answers: answerSchema,
  }),
]);
export const testSchema = z.object({
  exam_id: z.string().min(1).max(80),
  test_name: z.string().trim().min(3).max(200),
  duration_minutes: z.coerce.number().int().min(1).max(360),
  subject_topic: z.string().max(500),
  instructions: z.string().max(5000),
  test_category: z.enum(["demo", "standard", "upcoming"]),
  date_scheduled: z.string().nullable(),
  published: z.boolean(),
});
export const questionSchema = z.object({
  test_id: z.coerce.number().int().positive(),
  question_text: z.string().trim().min(1).max(10000),
  options: z.object({
    a: z.string().trim().min(1).max(3000),
    b: z.string().trim().min(1).max(3000),
    c: z.string().trim().min(1).max(3000),
    d: z.string().trim().min(1).max(3000),
  }),
  correct_option: z.enum(["a", "b", "c", "d"]),
  marks: z.coerce.number().int().min(1).max(100),
  image_url: z
    .union([
      z.literal(""),
      z.url().refine((v) => v.startsWith("https://"), "Use an HTTPS image URL"),
    ])
    .nullable(),
});
