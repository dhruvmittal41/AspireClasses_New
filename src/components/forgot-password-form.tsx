"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: resetError } =
        await supabaseBrowser().auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
          },
        );
      if (resetError) throw resetError;
      setSent(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not send the reset email.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-card">
      <span className="eyebrow">A FRESH START</span>
      <h1>Reset your password.</h1>
      <p>
        {sent
          ? "If an account uses this email, we’ve sent a secure reset link."
          : "Enter your email and we’ll send a secure reset link."}
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {!sent && (
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={busy || !isConfigured()}
            />
          </label>
          <button className="button full" disabled={busy || !isConfigured()}>
            {busy ? "Sending…" : "Send reset link"}
            <Mail size={18} />
          </button>
        </form>
      )}
      <Link className="text-link spaced" href="/login">
        Back to login <ArrowRight size={17} />
      </Link>
    </div>
  );
}
