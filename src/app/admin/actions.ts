"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { testSchema, questionSchema } from "@/lib/validation";
export type ActionState = { ok: boolean; message: string; href?: string };
const text = (form: FormData, key: string) => String(form.get(key) || "");
const positive = z.coerce.number().int().positive();
export async function adminAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requireAdmin();
  try {
    const action = text(form, "action");
    let href: string | undefined;
    let error: { message: string } | null = null;
    if (action === "save-test") {
      const date = text(form, "date_scheduled");
      const input = testSchema.parse({
        exam_id: text(form, "exam_id"),
        test_name: text(form, "test_name"),
        duration_minutes: text(form, "duration_minutes"),
        subject_topic: text(form, "subject_topic"),
        instructions: text(form, "instructions"),
        test_category: text(form, "test_category"),
        date_scheduled: date
          ? z.iso.datetime().parse(new Date(date + "+05:30").toISOString())
          : null,
        published: form.get("published") === "on",
      });
      const id = text(form, "id");
      if (input.published) {
        if (!id)
          return {
            ok: false,
            message: "Save as a draft first, add questions, then publish.",
          };
        const { count, error: countError } = await db
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("test_id", positive.parse(id));
        if (countError) throw countError;
        if (!count)
          return {
            ok: false,
            message: "Add at least one question before publishing.",
          };
      }
      const result = id
        ? await db.from("tests").update(input).eq("id", positive.parse(id)).select("id").single()
        : await db.from("tests").insert(input).select("id").single();
      error = result.error;
      if (!id && result.data) href = "/admin/update-questions?test=" + result.data.id;
    } else if (action === "save-question") {
      const input = questionSchema.parse({
        test_id: text(form, "test_id"),
        question_text: text(form, "question_text"),
        options: Object.fromEntries(
          ["a", "b", "c", "d"].map((k) => [k, text(form, k)]),
        ),
        correct_option: text(form, "correct_option"),
        marks: text(form, "marks"),
        image_url: text(form, "image_url") || null,
      });
      const image = form.get("image");
      if (image instanceof File && image.size) {
        if (
          image.size > 2 * 1024 * 1024 ||
          !["image/png", "image/jpeg", "image/webp"].includes(image.type)
        )
          return {
            ok: false,
            message: "Use a PNG, JPEG, or WebP image smaller than 2 MB.",
          };
        const extension = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/webp": "webp",
        }[image.type];
        const path = crypto.randomUUID() + "." + extension;
        const upload = await db.storage
          .from("question-images")
          .upload(path, image, { contentType: image.type });
        if (upload.error) throw upload.error;
        input.image_url = db.storage
          .from("question-images")
          .getPublicUrl(path).data.publicUrl;
      }
      const id = text(form, "id");
      const result = id
        ? await db.from("questions").update(input).eq("id", positive.parse(id)).eq("test_id", input.test_id).select("id").single()
        : await db.from("questions").insert(input).select("id").single();
      error = result.error;
    } else if (action === "delete-question") {
      if (form.get("confirm") !== "on")
        return {
          ok: false,
          message: "Confirm removal before deleting this question.",
        };
      const result = await db
        .from("questions")
        .delete()
        .eq("id", positive.parse(text(form, "id")));
      error = result.error;
    } else if (action === "assign-test") {
      const user_id = z.uuid().parse(text(form, "user_id"));
      const test_id = positive.parse(text(form, "test_id"));
      const result = await db
        .from("enrollments")
        .upsert({ user_id, test_id }, { onConflict: "user_id,test_id" });
      error = result.error;
    } else if (action === "assign-bundle") {
      const user_id = z.uuid().parse(text(form, "user_id"));
      const bundle_id = positive.parse(text(form, "bundle_id"));
      const { data, error: readError } = await db
        .from("bundle_tests")
        .select("test_id")
        .eq("bundle_id", bundle_id);
      if (readError) throw readError;
      if (!data.length)
        return {
          ok: false,
          message: "Add tests to this bundle before assigning it.",
        };
      const result = await db.from("enrollments").upsert(
        data.map((t) => ({ user_id, test_id: t.test_id })),
        { onConflict: "user_id,test_id" },
      );
      error = result.error;
    } else if (action === "revoke-test") {
      if (form.get("confirm") !== "on")
        return { ok: false, message: "Confirm before revoking access." };
      const result = await db
        .from("enrollments")
        .delete()
        .eq("user_id", z.uuid().parse(text(form, "user_id")))
        .eq("test_id", positive.parse(text(form, "test_id")));
      error = result.error;
    } else if (action === "save-exam") {
      const input = z
        .object({
          id: z
            .string()
            .regex(/^[a-z0-9-]+$/)
            .max(80),
          slug: z
            .string()
            .regex(/^[a-z0-9-]+$/)
            .max(100),
          name: z.string().trim().min(2).max(150),
          description: z.string().min(10).max(2000),
          subjects: z.array(z.string().min(1)).min(1),
          status: z.enum(["active", "coming_soon"]),
          sort_order: z.coerce.number().int().min(0),
        })
        .parse({
          id: text(form, "id"),
          slug: text(form, "slug"),
          name: text(form, "name"),
          description: text(form, "description"),
          subjects: text(form, "subjects")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: text(form, "status"),
          sort_order: text(form, "sort_order"),
        });
      const result = form.get("existing") === "true"
        ? await db.from("exams").update(input).eq("id", input.id).select("id").single()
        : await db.from("exams").insert(input);
      error = result.error;
    } else if (action === "save-bundle") {
      const input = z
        .object({
          exam_id: z.string().min(1),
          bundle_name: z.string().min(3).max(200),
          description: z.string().max(3000),
          price: z.coerce.number().min(0).max(999999),
          features: z.array(z.string()),
          published: z.boolean(),
        })
        .parse({
          exam_id: text(form, "exam_id"),
          bundle_name: text(form, "bundle_name"),
          description: text(form, "description"),
          price: text(form, "price"),
          features: text(form, "features")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          published: form.get("published") === "on",
        });
      const id = text(form, "id");
      const result = id
        ? await db.from("bundles").update(input).eq("id", positive.parse(id)).select("id").single()
        : await db.from("bundles").insert(input);
      error = result.error;
    } else if (action === "bundle-test") {
      const bundleId = positive.parse(text(form, "bundle_id"));
      const testId = positive.parse(text(form, "test_id"));
      const [bundle, test] = await Promise.all([
        db.from("bundles").select("exam_id").eq("id", bundleId).single(),
        db.from("tests").select("exam_id").eq("id", testId).single(),
      ]);
      if (bundle.error || test.error) throw bundle.error || test.error;
      if (bundle.data.exam_id !== test.data.exam_id) return { ok: false, message: "Choose a test from the same exam as this bundle." };
      const result = await db
        .from("bundle_tests")
        .upsert({
          bundle_id: bundleId,
          test_id: testId,
        }, { onConflict: "bundle_id,test_id" });
      error = result.error;
    } else if (action === "remove-bundle-test") {
      const result = await db
        .from("bundle_tests")
        .delete()
        .eq("bundle_id", positive.parse(text(form, "bundle_id")))
        .eq("test_id", positive.parse(text(form, "test_id")));
      error = result.error;
    } else {
      return { ok: false, message: "Unknown admin action." };
    }
    if (error) throw error;
    revalidatePath("/admin", "layout");
    revalidatePath("/dashboard", "layout");
    if (!["assign-test", "assign-bundle", "revoke-test"].includes(action)) {
      revalidatePath("/");
      revalidatePath("/exams", "layout");
      revalidatePath("/tests/[id]", "page");
    }
    const messages: Record<string, string> = {
      "save-test": href ? "Draft created. Next, add your questions." : "Test updated.",
      "save-question": text(form, "id") ? "Question updated." : "Question added. You can add the next one.",
      "delete-question": "Question removed.", "assign-test": "Test access granted.",
      "assign-bundle": "Bundle tests assigned.", "revoke-test": "Test access removed.",
    };
    return { ok: true, message: messages[action] || "Changes saved.", href };
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code === "23505") return { ok: false, message: "That ID or URL slug is already in use. Choose a unique one, or edit the existing record." };
    if (code === "23503" || code === "PGRST116") return { ok: false, message: "This record is no longer available. Refresh the page and choose an existing record." };
    if (error instanceof z.ZodError)
      return {
        ok: false,
        message: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      };
    console.error(
      "Admin operation failed",
      error instanceof Error ? error.message : "Database operation failed",
    );
    return {
      ok: false,
      message:
        "Could not save. Check required fields, unique IDs, and your database connection.",
    };
  }
}
