"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/site";

const MIN_PASSWORD_LENGTH = 8;

function authMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return "The email or password is incorrect.";
  if (normalized.includes("email not confirmed"))
    return "Confirm your email using the link we sent, then try again.";
  if (normalized.includes("user already registered"))
    return "An account already exists for this email. Try logging in instead.";
  if (normalized.includes("password should be at least"))
    return `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
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

export function AuthForm({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNext(search.get("next"));
  const configured = isConfigured();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (password.length < MIN_PASSWORD_LENGTH)
        throw new Error(
          `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
      if (register && password !== confirmPassword)
        throw new Error("The passwords do not match.");
      const db = supabaseBrowser();
      if (register) {
        const { data, error: signUpError } = await db.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: name.trim(), school_name: school.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else
          setMessage(
            "Account created. Check your email to confirm it, then log in with your password.",
          );
      } else {
        const { error: loginError } = await db.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (loginError) throw loginError;
        router.replace(next);
        router.refresh();
      }
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
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
      <span className="eyebrow">
        {register ? "A NEW STEP FORWARD" : "WELCOME BACK"}
      </span>
      <h1>
        {register ? "Your ambition belongs here." : "Good to have you back."}
      </h1>
      <p>
        {register
          ? "Create your Aspire account and keep your preparation in one place."
          : "Log in with your email and password to continue."}
      </p>
      {!configured && (
        <div className="notice">
          Accounts will be available once the site’s Supabase connection is
          configured.
        </div>
      )}
      {search.get("error") && (
        <p role="alert" className="error-message">
          {search.get("error") === "password-reset"
            ? "That password reset link is invalid or expired."
            : "Sign-in could not be completed. Please try again."}
        </p>
      )}
      {message && (
        <p role="status" className="success-message notice">
          {message}
        </p>
      )}
      <form onSubmit={submit}>
        {register && (
          <>
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
                maxLength={120}
                disabled={busy}
              />
            </label>
            <label>
              School
              <input
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                autoComplete="organization"
                required
                maxLength={200}
                disabled={busy}
              />
            </label>
          </>
        )}
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            disabled={busy}
          />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={register ? "new-password" : "current-password"}
          disabled={busy}
        />
        {register && (
          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            disabled={busy}
          />
        )}{" "}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button full" disabled={busy || !configured}>
          {busy ? "One moment…" : register ? "Create account" : "Log in"}
          <ArrowRight size={18} />
        </button>
      </form>
      {!register && (
        <Link
          className="text-link auth-forgot"
          href={`/forgot-password?next=${encodeURIComponent(next)}`}
        >
          Forgot your password?
        </Link>
      )}
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
            Continue with Google
          </button>
        </>
      )}
      <p className="auth-switch">
        {register ? "Already part of Aspire?" : "First time here?"}{" "}
        <Link
          href={
            (register ? "/login" : "/register") +
            "?next=" +
            encodeURIComponent(next)
          }
        >
          {register ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
