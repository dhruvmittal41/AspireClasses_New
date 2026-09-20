"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isConfigured } from "@/lib/supabase/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AuthForm } from "./auth-form";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  if (!isConfigured()) return <AuthForm />;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabaseBrowser().auth.updateUser({
      password,
    });
    if (updateError) setError(updateError.message);
    else {
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 800);
    }
    setBusy(false);
  }
  return (
    <div className="auth-card">
      <span className="eyebrow">ONE MORE STEP</span>
      <h1>Choose a new password.</h1>
      {done ? (
        <p className="notice">
          Your password has been updated. Taking you to your dashboard…
        </p>
      ) : (
        <form onSubmit={submit}>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              disabled={busy}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              disabled={busy}
            />
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Saving…" : "Update password"}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
