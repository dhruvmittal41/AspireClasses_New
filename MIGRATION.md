# Existing-site data cutover

The legacy repository contains multiple versions of its schema. In particular, the checked-in initial migration does not cover all fields used by the current application (`user_tests`, bundles, full profile fields, and OTP tables). Use an actual production schema/data export as the source of truth. Back up the current database before any cutover.

## Mapping

| Legacy data                                    | New destination                                              | Notes                                                                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`                                        | Supabase `auth.users` + `public.profiles`                    | Integer IDs must be mapped to verified Supabase UUIDs by normalized email. Never reuse old custom JWTs or OTPs.                                                    |
| Test exam/category                             | `public.exams`                                               | Classify each test explicitly as AMU 9, AMU 11, or another collection. The old generic test type does not identify the entrance exam.                              |
| `tests`                                        | `public.tests`                                               | Preserve test IDs for existing `/tests/:id` URLs. New tests derive question counts from actual questions. Import as drafts until reviewed.                         |
| `questions`                                    | `public.questions`                                           | Preserve question and test IDs; normalize options to `a`, `b`, `c`, `d` and answer keys to lowercase. Existing LaTeX and HTTPS image links are supported.          |
| `test_bundles`                                 | `public.bundles`                                             | Preserve IDs for old bundle/payment URLs. Map each bundle to its exam explicitly.                                                                                  |
| Bundle membership                              | `public.bundle_tests`                                        | Inspect the live schema/source; the repository does not contain a reliable authoritative mapping.                                                                  |
| `user_tests` / `assigned_testid`               | `public.enrollments`                                         | Convert user IDs using the verified identity map. Include old single-test assignments if they are still authoritative.                                             |
| `results`                                      | An archival export, or a separate reviewed migration         | Historical data lacks per-attempt question snapshots, total marks, and correct-answer counts. Do not invent these values or convert scores into “correct answers.” |
| Cloudinary images                              | Keep their existing HTTPS URLs, or copy to `question-images` | Existing image URLs work. Storage uploads going forward use Supabase.                                                                                              |
| OTPs / refresh tokens / custom admin passwords | Not imported                                                 | Supabase Auth replaces these.                                                                                                                                      |

## Recommended order

1. Export the production schema and the tables above to a private backup; do not commit student data or database credentials.
2. Apply the new migration and exam seed to a fresh Supabase project.
3. Import tests, questions, bundles, and bundle membership with explicit exam mappings. Keep tests unpublished until their answer options, correct keys, durations, and image URLs are reviewed.
4. After explicit integer-ID imports, reset identity sequences so new admin-created rows do not conflict:

```sql
select setval(pg_get_serial_sequence('public.tests','id'), coalesce((select max(id) from public.tests),0)+1, false);
select setval(pg_get_serial_sequence('public.questions','id'), coalesce((select max(id) from public.questions),0)+1, false);
select setval(pg_get_serial_sequence('public.bundles','id'), coalesce((select max(id) from public.bundles),0)+1, false);
```

5. Choose an identity migration approach: provision users through the Supabase Admin API in a private one-time migration, or have returning students verify their existing email through `/register`. Never put a service-role key in `NEXT_PUBLIC_*` variables. The normal app does not use one.
6. Match old users to verified Auth users by normalized email and write a private old-ID → UUID mapping. Restore profile details and paid assignments using that map. Deal with phone-only accounts explicitly instead of assuming they have an email identity.
7. Retain the original results as an archive. If historical results must appear in the new UI, design a reviewed legacy-results import that clearly labels missing totals/correct counts. The new `results` table intentionally references a real attempt snapshot and must not be populated with fabricated historical attempts.
8. Publish reviewed tests, grant the owner admin role, and verify the essential flows against Supabase.
9. Take a final data delta while the old site is read-only, then move DNS. Keep the old backup and hosting available during the rollback window.

The source export and Supabase project were not provided in this session, so no production data or DNS has been modified. The two legacy folders remain available to help map the real export.
