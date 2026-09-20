"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldAlert } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";

const MIN_PASSWORD_LENGTH = 8;

function authMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return "The email or password is incorrect.";
  if (normalized.includes("email not confirmed"))
    return "Confirm your email using the link we sent, then try again.";
  return message || "Something went wrong. Please try again.";
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="password-field">
      {label}
      <span className="password-input-wrap">
        <LockKeyhole size={16} aria-hidden="true" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={72}
          required
          disabled={disabled}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
}

export function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const configured = isConfigured();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (password.length < MIN_PASSWORD_LENGTH)
        throw new Error(
          `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`,
        );

      const db = supabaseBrowser();
      
      // Sign in with password
      const { error: loginError } = await db.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (loginError) throw loginError;

      // Verify admin status
      const { data: isAdmin, error: adminCheckError } = await db.rpc(
        "is_admin"
      );

      if (adminCheckError) {
        await db.auth.signOut();
        throw new Error("Unable to verify admin access.");
      }

      if (!isAdmin) {
        await db.auth.signOut();
        throw new Error(
          "This account is not authorized for admin access. Contact an administrator if you believe this is an error.",
        );
      }

      // Success - redirect to admin dashboard
      router.replace("/admin");
      router.refresh();
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <ShieldAlert size={24} style={{ color: "var(--color-primary)" }} />
        <span className="eyebrow">ADMIN ACCESS</span>
      </div>
      <h1>Administrator Login</h1>
      <p>
        This area is restricted to authorized administrators only. Please sign
        in with your admin credentials.
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
      <form onSubmit={submit}>
        <label>
          Admin email address
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
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={busy}
        />
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button full" disabled={busy || !configured}>
          {busy ? "Verifying…" : "Sign in as admin"}
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
      <p className="auth-switch" style={{ textAlign: "center", marginTop: "1.5rem" }}>
        Not an admin?{" "}
        <a href="/login" style={{ color: "var(--color-primary)" }}>
          Regular login
        </a>
      </p>
    </div>
  );
}
