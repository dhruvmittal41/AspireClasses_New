import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/supabase/config";
import { attemptInput } from "@/lib/validation";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  if (!isConfigured())
    return NextResponse.json(
      { error: "Accounts are not configured yet." },
      { status: 503 },
    );
  if (Number(request.headers.get("content-length") || 0) > 64000)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const db = await supabaseServer();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user)
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 64000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    body = attemptInput.safeParse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body.success)
    return NextResponse.json(
      { error: "Please check the test and answer details." },
      { status: 400 },
    );
  const input = body.data;
  const { data, error } =
    input.action === "start"
      ? await db.rpc("start_attempt", { p_test_id: input.testId })
      : await db.rpc(
          input.action === "save" ? "save_answers" : "submit_attempt",
          { p_attempt_id: input.attemptId, p_answers: input.answers },
        );
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === "P0001"
            ? error.message
            : "Could not save your test. Please retry.",
      },
      { status: 400 },
    );
  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
