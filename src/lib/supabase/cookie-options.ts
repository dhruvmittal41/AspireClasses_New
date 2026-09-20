// Shared browser/server cookie policy. The browser SDK needs cookie access
// to refresh sessions; tokens must never be stored in Redux.
export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};
