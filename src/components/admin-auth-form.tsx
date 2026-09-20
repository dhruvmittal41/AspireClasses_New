"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, ShieldAlert } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";

function authMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("email not confirmed"))
    return "Please confirm your email first, then try again.";
  if (normalized.includes("email rate limit"))
    return "Too many attempts. Please wait a few minutes and try again.";
  return message || "Something went wrong. Please try again.";
}

export function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const configured = isConfigured();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const db = supabaseBrowser();
      const trimmedEmail = email.trim().toLowerCase();

      // First check if this email is in the admin allowlist
      const { data: allowlistCheck, error: allowlistError } = await db
        .from("admin_allowlist")
        .select("enabled")
        .eq("email", trimmedEmail)
        .single();

      if (allowlistError || !allowlistCheck || !allowlistCheck.enabled) {
        throw new Error(
          "This email is not authorized for admin access. Contact an administrator if you believe this is an error.",
        );
      }

      // Send magic link (OTP)
      const { error: otpError } = await db.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/admin")}&admin=true`,
        },
      });

      if (otpError) throw otpError;

      setMessage(
        "Magic link sent! Check your email and click the link to sign in as admin.",
      );
    } catch (caught) {
      setError(
        authMessage(
          caught instanceof Error ? caught.message : "Please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setError("");
    const { error: googleError } = await supabaseBrowser().auth.signInWithOAuth(
      {
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/admin")}&admin=true`,
        },
      },
    );
    if (googleError) {
      setError(authMessage(googleError.message));
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <ShieldAlert size={24} style={{ color: "var(--color-primary)" }} />
        <span className="eyebrow">ADMIN ACCESS</span>
      </div>
      <h1>Administrator Login</h1>
      <p>
        This area is restricted to authorized administrators only. Enter your
        admin email to receive a secure login link.
      </p>
      {!configured && (
        <div className="notice">
          Admin login will be available once the site's Supabase connection is
          configured.
        </div>
      )}
      {search.get("error") === "unauthorized" && (
        <p role="alert" className="error-message">
          Your account is not authorized for admin access.
        </p>
      )}
      {search.get("error") === "callback" && (
        <p role="alert" className="error-message">
          Sign-in could not be completed. Please try again.
        </p>
      )}
      {message && (
        <p role="status" className="success-message notice">
          {message}
        </p>
      )}
      <form onSubmit={submit}>
        <label>
          Admin email address
          <span className="password-input-wrap">
            <Mail size={16} aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              maxLength={254}
              placeholder="admin@example.com"
              disabled={busy}
            />
          </span>
        </label>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button full" disabled={busy || !configured}>
          {busy ? "Sending magic link…" : "Send magic link"}
          <ArrowRight size={18} />
        </button>
      </form>
      {googleEnabled && (
        <>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <button
            type="button"
            disabled={busy || !configured}
            className="button secondary full"
            onClick={google}
          >
            Continue with Google (Admin)
          </button>
        </>
      )}
      <p
        className="auth-switch"
        style={{ textAlign: "center", marginTop: "1.5rem" }}
      >
        Not an admin?{" "}
        <a href="/login" style={{ color: "var(--color-primary)" }}>
          Regular login
        </a>
      </p>
    </div>
  );
}
