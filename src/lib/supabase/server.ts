import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { credentials } from "./config";
export async function supabaseServer() {
  const { url, key } = credentials();
  const jar = await cookies();
  return createServerClient(url, key, {
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
}
