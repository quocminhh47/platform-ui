# Production readiness (Phase 8B)

## Vercel

- Build command: `npm run build`; output directory: `dist`. Use Node 22.12+
  (the installed Vite requires Node `^20.19.0 || >=22.12.0`).
- Configure `VITE_API_BASE_URL` for Production and applicable Preview environments
  as the Render HTTPS origin, for example `https://your-api.onrender.com` (no
  credentials, query, fragment, or trailing slash). It is compiled into public
  JavaScript; never put database credentials or JWT signing secrets in `VITE_*`.
- Local development continues to use `.env.development`. Vite does not load that
  file in production mode. Missing/malformed production API configuration fails
  the build. A changed API origin requires a rebuild.
- SPA rewrites cover frontend deep links, including article and admin pages.
  `/api` and `/assets` are excluded so missing resources do not return HTML.
  APIs are called at the configured absolute Render origin; there is no API proxy.
- Existing static files take precedence over rewrites, per
  [Vercel configuration documentation](https://vercel.com/docs/project-configuration/vercel-json).
- Creation/editing routes lazily load their page and shared TipTap code under
  existing auth/admin guards, with a Vietnamese Suspense loading message.
  Public listing/detail and homepage do not eagerly import the editor.

## Render and Neon

Use the backend's `DEPLOYMENT.md`. Set `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`
(PostgreSQL JDBC URL with `sslmode=require`), `DB_USERNAME`, `DB_PASSWORD`,
`JWT_SECRET` (at least 32 bytes), and `CORS_ALLOWED_ORIGINS` (exact Vercel HTTPS
origin, comma-separated when needed). Render supplies `PORT`. `FRONTEND_URL`
is optional and merges one extra origin; it does not replace required production
`CORS_ALLOWED_ORIGINS`.

Keep health check path `/health/ready`. Flyway runs at backend startup, followed
by Hibernate schema validation. No hosted settings, DNS, migrations, or production
connections were touched by this audit. Actual hosting configuration still needs
manual verification. Sleeping services may cause slow first requests; writes
are intentionally not automatically retried.

## Remaining limits

- No browser QA, hosted smoke test, load test, or production connection/reconnect
  test was performed.
- Article payloads include full HTML in management lists, and personal filtering
  walks up to 40 pages of 100 records; large catalogs warrant pagination/payload
  work beyond this targeted bundle change.
- Concurrent moderation and same-title slug allocation need dedicated concurrency
  tests and a transaction/locking design (carried over from Phase 8A).

## Local validation

- Before: initial JS 996.05 kB / 292.48 kB gzip.
- After: initial JS 569.13 kB / 160.54 kB gzip, including the 113.44 kB
  shared preloaded chunk. Main entry alone is 455.69 kB; shared editor code is
  deferred (425.73 kB). CSS remains 111.32 kB. No manual chunk rules were added.
- Production build passed without the former >500 kB chunk warning. Frontend
  lint passed with existing hook warnings. The focused article/auth/route/config
  test run passed 72 tests.
- Backend compilation and 15 focused health/CORS/article/production-config tests
  passed. Integration tests used the isolated H2 test database, not Neon.

Hosted verification: [Phase 8C smoke-test checklist](production-smoke-test.md).
