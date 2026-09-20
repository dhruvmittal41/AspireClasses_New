"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: resetError } = await supabaseBrowser().rpc("request_password_help", {
        p_email: email.trim().toLowerCase(), p_contact: contact.trim(),
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError(
        "Could not submit your request. Please try again or contact Aspire support.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-card">
      <span className="eyebrow">A FRESH START</span>
      <h1>Request password help.</h1>
      <p>
        {sent
          ? "Your request has been received. Aspire staff will review it and contact you. Your password has not changed."
          : "Enter your account email and a phone number where Aspire staff can contact you. No email code is needed."}
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
              maxLength={254}
              disabled={busy || !isConfigured()}
            />
          </label>
          <label>
            Student or parent phone number
            <input type="tel" value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="tel" required minLength={7} maxLength={40} disabled={busy} />
          </label>
          <button className="button full" disabled={busy || !isConfigured()}>
            {busy ? "Submitting…" : "Request help from admin"}
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
