"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const { error } = await supabaseBrowser()
        .from("profiles")
        .update({
          full_name: String(form.get("full_name")).trim(),
          school_name: String(form.get("school_name")).trim(),
          mobile_number: String(form.get("mobile_number")).trim(),
          city: String(form.get("city")).trim(),
          dob: String(form.get("dob") || "") || null,
          gender: String(form.get("gender") || ""),
          state: String(form.get("state") || "").trim(),
          country: String(form.get("country") || "").trim(),
        })
        .eq("id", profile.id);
      if (error) throw error;
      setMessage("Your profile has been saved.");
      router.refresh();
    } catch {
      setMessage("Could not save your profile. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel form-grid" onSubmit={save}>
      <label>
        Full name
        <input
          name="full_name"
          defaultValue={profile.full_name}
          autoComplete="name"
          maxLength={120}
          required
        />
      </label>
      <label>
        Email
        <input value={email} disabled />
        <small>Your sign-in email</small>
      </label>
      <label>
        School
        <input
          name="school_name"
          defaultValue={profile.school_name}
          maxLength={200}
        />
      </label>
      <label>
        Mobile number
        <input
          name="mobile_number"
          type="tel"
          defaultValue={profile.mobile_number}
          maxLength={20}
        />
      </label>
      <label>
        City
        <input
          name="city"
          defaultValue={profile.city}
          autoComplete="address-level2"
          maxLength={120}
        />
      </label>
      <label>
        Date of birth
        <input
          name="dob"
          type="date"
          defaultValue={profile.dob || ""}
          autoComplete="bday"
        />
      </label>
      <label>
        Gender (optional)
        <input name="gender" defaultValue={profile.gender} maxLength={60} />
      </label>
      <label>
        State
        <input
          name="state"
          defaultValue={profile.state}
          autoComplete="address-level1"
          maxLength={120}
        />
      </label>
      <label>
        Country
        <input
          name="country"
          defaultValue={profile.country}
          autoComplete="country-name"
          maxLength={120}
        />
      </label>
      <div className="form-bottom">
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save my details"}
        </button>
        <p role="status">{message}</p>
      </div>
    </form>
  );
}
