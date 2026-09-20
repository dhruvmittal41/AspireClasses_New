"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { isConfigured } from "@/lib/supabase/config";
import { verifyAdminEmail } from "@/app/admin-login/actions";

export function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const search = useSearchParams();
  const configured = isConfigured();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await verifyAdminEmail(email);

      if (result?.error) {
        setError(result.error);
      }
      // If no error, the server action will redirect to /admin
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">ADMIN ACCESS</span>
      <h1>Administrator Login</h1>
      <p>Enter your authorized admin email to access the admin dashboard.</p>
      {!configured && (
        <div className="notice">
          Admin login will be available once the site's Supabase connection is
          configured.
        </div>
      )}
      {search.get("error") === "unauthorized" && (
        <p role="alert" className="error-message">
          Your session expired or you don't have admin access.
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
              style={{ paddingLeft: "2.5rem" }}
            />
          </span>
        </label>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button full" disabled={busy || !configured}>
          {busy ? "Verifying…" : "Access Admin Dashboard"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-switch">
        Not an admin? <a href="/login">Regular login</a>
      </p>
    </div>
  );
}
