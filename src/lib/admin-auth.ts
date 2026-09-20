import "server-only";
// Pages and mutations must use the same verified Supabase session.
export { requireAdmin } from "./auth";
