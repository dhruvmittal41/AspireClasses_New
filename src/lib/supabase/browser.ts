import { createBrowserClient } from "@supabase/ssr";
import { credentials } from "./config";
export function supabaseBrowser() {
  const { url, key } = credentials();
  return createBrowserClient(url, key);
}
