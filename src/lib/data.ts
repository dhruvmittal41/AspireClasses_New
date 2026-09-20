import "server-only";
import { createClient } from "@supabase/supabase-js";
import { credentials, isConfigured } from "./supabase/config";
import { starterExams } from "./site";
import type { Exam, Test, Bundle } from "./types";
export async function catalog(): Promise<{
  exams: Exam[];
  tests: Test[];
  bundles: Bundle[];
  configured: boolean;
}> {
  if (!isConfigured())
    return { exams: starterExams, tests: [], bundles: [], configured: false };
  const { url, key } = credentials();
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const [exams, tests, bundles] = await Promise.all([
    db.from("exams").select("*").order("sort_order"),
    db.from("tests").select("*").eq("published", true).order("id"),
    db.from("bundles").select("*").eq("published", true).order("id"),
  ]);
  if (exams.error || tests.error || bundles.error)
    throw new Error(
      "The test catalog is temporarily unavailable. Please try again.",
    );
  return {
    exams: exams.data as Exam[],
    tests: tests.data as Test[],
    bundles: bundles.data as Bundle[],
    configured: true,
  };
}
