import "server-only";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { credentials } from "./config";
import { authCookieOptions } from "./cookie-options";
export const supabaseServer = cache(async () => {
  const { url, key } = credentials();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Proxy refreshes cookies for server components. */
        }
      },
    },
  });
});
