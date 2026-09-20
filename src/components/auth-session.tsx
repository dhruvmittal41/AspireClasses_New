"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isConfigured } from "@/lib/supabase/config";

export function AuthSession() {
  const router = useRouter();
  useEffect(() => {
    if (!isConfigured()) return;
    // Initialize after hard reloads too; the SDK owns cookie persistence,
    // automatic token refresh and cross-tab session events.
    const db = supabaseBrowser();
    const { data: { subscription } } = db.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);
  return null;
}
