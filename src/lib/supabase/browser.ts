import { createBrowserClient } from "@supabase/ssr";
import { credentials } from "./config";
import { authCookieOptions } from "./cookie-options";
export function supabaseBrowser() {
  const { url, key } = credentials();
  return createBrowserClient(url, key, { cookieOptions: authCookieOptions });
}
