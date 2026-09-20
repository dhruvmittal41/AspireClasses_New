# Aspire Classes

A unified **Next.js App Router + TypeScript** application with **Supabase Auth/Postgres/Storage** and **Redux Toolkit**. Deploy the repository root on Vercel; there is no separate Express service.

The previous `frontend/` and `backend/` directories are retained as migration references. They are not imported, built, or deployed by the root app. Do not run their destructive `schema.sql` against Supabase.

## Run locally

Use Node.js 22 LTS or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without Supabase environment variables, public pages display a clearly empty test catalog with starter exam categories. Sign-in is disabled until configured. No fake student data, scores, test counts, or paid products are shown.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Connect Supabase

For a fresh Supabase project, run [complete_supabase_import.sql](supabase/complete_supabase_import.sql) once in the SQL Editor. It includes the new schema, seed catalog, converted legacy content, archive tables, and the automatic legacy-account linker. Do not run the original dump directly: it drops tables, uses the old integer-user model, and contains expired OTPs. If the new schema and seed are already installed, run only [legacy_import.sql](supabase/legacy_import.sql).

1. Create a **new** Supabase project.
2. The complete script includes `supabase/migrations/202609200001_initial.sql` and `supabase/seed.sql`. The migration creates the application tables, row-level security, attempt functions, profile trigger, and a question-image storage bucket. It is a one-time migration, not an idempotent reset script.
3. Set these in `.env.local` and your Vercel environment:
   - `NEXT_PUBLIC_SUPABASE_URL`: project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable API key (the legacy anon key also works).
   - `NEXT_PUBLIC_SITE_URL`: the actual site origin, including `https://`, without a trailing slash in production.
4. In Supabase Authentication → URL Configuration, set the Site URL and allowed callback URLs: `http://localhost:3000/auth/callback` and `https://YOUR_DOMAIN/auth/callback`. Add a particular preview URL when testing previews.
5. Enable **Email provider → Email + password** in Supabase Auth. The app uses `signUp` and `signInWithPassword`; it does not use OTP login. If email confirmation is enabled, registration displays a confirmation message and the email link returns through `/auth/callback`. The login screen includes a secure password reset flow at `/forgot-password` → `/reset-password`.
6. Enable/configure the **Google provider** in Supabase Auth. Create a Google OAuth web client, add your site origin to its JavaScript origins, add Supabase’s provider callback URL to its redirect URIs, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`. The app sends Google through `/auth/callback` using the PKCE code exchange. Add both localhost and production callback URLs to Supabase Auth’s redirect allow list.
7. Register your owner account through `/register`. Promote that known account using the SQL editor:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id and lower(u.email) = lower('YOUR_ADMIN_EMAIL');
```

There is deliberately no self-service admin signup. Application roles never come from user-editable auth metadata. No service-role secret is needed by the application.

## Manage the site

Visit `/admin` with the promoted account:

- **Exams:** add new exam collections, descriptions, subjects, and public slugs without code changes. Keep published slugs stable or add redirects when changing them.
- **Tests:** create a draft, set duration/opening time, add questions, then publish. All dates in the admin editor are India Standard Time.
- **Questions:** four options, one correct answer, marks, optional image URL/upload. Use `$...$` for inline equations and `$$...$$` for display equations. Remove an image by clearing its URL.
- **Assignments:** grant/revoke test access or assign all tests currently included in a bundle. Bundle assignments are a snapshot: adding another test to a bundle later does not automatically enroll existing students; reassign the bundle as needed.
- **Bundles:** create catalog offerings and map tests to them. Publishing a bundle does not unlock its tests automatically.

Published demo tests are accessible to signed-in students. Standard tests need an enrollment or admin role. An `upcoming` test stays closed until its type is changed to `standard` or `demo`; the optional opening time is an additional gate.

Students get a dashboard, assigned tests, schedule, profile editing, email doubt support, and a results history with scores and correct-answer counts.

### Payment is static

`/payment/bundle/[id]` displays **only a QR code and UPI ID**. There is no gateway, payment API, webhook, order tracking, payment confirmation, or automatic access grant.

The original UPI ID is retained in `src/lib/payment.ts`. A standard amount-free UPI QR is generated at `public/payment-qr.svg` using the same destination in `scripts/generate-payment-qr.mjs`. To change the destination, update both files and run `npm run payment:qr`. You may replace the SVG with your actual merchant QR and update `qrImage`. Verify the recipient with a UPI app before launch.

## How tests are secured

- Next.js routes and server actions verify the authenticated user; admin pages/actions verify the role again.
- Supabase row-level security is the enforcement boundary, including requests made directly to Supabase.
- Students cannot query the question table or answer keys. `start_attempt` returns only a stripped, immutable question snapshot.
- Attempts live in a private schema. The database creates deadlines, saves answers, and scores submissions transactionally.
- Answers auto-save after a short debounce and retry periodically. After the deadline, scoring uses only answers saved before expiry. A disconnected browser cannot extend a test by changing its clock.
- Reloading and starting/resuming the same test restores the active attempt and its saved answers. Review flags and current question are local Redux state and reset on resume.
- Duplicate submissions return the same result; concurrent starts reuse one active attempt per student/test.
- Current scoring uses per-question marks, zero for incorrect/unanswered answers, and no negative marking.
- An offline, expired attempt is finalized when the student returns and resumes/submits. There is no always-running worker.
- Questions edited later do not alter an already-started attempt's snapshot or score.

## SEO and performance

Public marketing/exam/bundle pages render server-side; public collections revalidate periodically and after admin edits. Canonical URLs, individual exam metadata, sitemap, robots rules, social-preview images, and organization structured data are included. Private routes use noindex. Redux stores are created per mounted provider, not shared between server requests; Redux handles catalog filters and active test state, while server data stays on the server.

Set `NEXT_PUBLIC_SITE_URL` **before the production build** so canonical URLs and the sitemap use your domain. Preserve the existing domain when moving hosting. `/home` permanently redirects to `/dashboard`; old test, bundle, payment, login, registration, and admin paths are retained. Old query-driven dashboard sections now have their own URLs under `/dashboard`.

The UI uses responsive layouts, semantic forms, keyboard focus styles, a skip link, reduced-motion support, accessible question navigation, and phone-friendly controls.

## Migrate existing data

See [MIGRATION.md](MIGRATION.md). The live Hostinger database was not supplied or changed. Do not point old Express code at the new schema: Supabase Auth uses UUID identities rather than the original integer user IDs.

## Deploy on Vercel

1. Import this repository, choose **Next.js**, and set Root Directory to the repository root (`.`), not `frontend` or `backend`.
2. Set Node.js to 22 LTS or a supported newer LTS. The root scripts are `npm run build` and `npm start`; Vercel detects Next.js automatically.
3. Add the environment variables above, apply/seed Supabase, and rebuild.
4. Confirm registration/email delivery, owner admin access, one demo attempt, one assigned test, and static QR accuracy against your own Supabase project.
5. Add your existing domain in Vercel and apply the exact DNS records Vercel provides. Preserve mail/MX records and keep Hostinger online until cutover is verified.

**Cost:** Vercel Hobby is for personal, non-commercial use. A commercial paid test-series site requires an eligible Vercel plan. Supabase Free has quotas and may pause inactive projects. Domain renewal and production email delivery can also cost money. This architecture removes the separate Express server, but does not guarantee entirely free commercial hosting.

References: [Next.js App Router](https://nextjs.org/docs/app), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side), [Redux Next.js setup](https://redux-toolkit.js.org/usage/nextjs), [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby), [Supabase email delivery](https://supabase.com/docs/guides/auth/auth-smtp), [Supabase pricing](https://supabase.com/pricing).

## Validation status

Local lint, TypeScript, and production-build checks are the intended lightweight checks. End-to-end authentication, migrations against a live Supabase project, real data import, and production deployment require the project credentials/configuration and have not been performed here. No extensive local test suite is included.
