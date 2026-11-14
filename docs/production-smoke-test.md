# Phase 8C — production deployment verification

Status: repository review completed; all hosted checks below are **pending**.
No confirmed production URLs or deployed revisions were supplied. No hosted
requests, production writes, restarts, migrations, deployments, or remote changes
were performed. Existing uncommitted changes were preserved.

## Configuration review and operator checks

| Area | Repository result | Verify manually in hosting dashboards |
|---|---|---|
| Vercel | Vite build validates an absolute HTTP(S) API URL; SPA fallback excludes `/api` and `/assets`; editor routes are lazy and guarded | Frontend root is `platform-ui`; build `npm run build`, output `dist`; Node 22.12+; exact intended deployment revision |
| API origin | Client appends `/api/...` to `VITE_API_BASE_URL`; value is compiled into the bundle | Production/Preview value is the exact Render **HTTPS origin**, with no whitespace, credentials, `/api` suffix, query, fragment, or trailing slash. Variable changes require a new build through the normal release process |
| Render | Docker uses Java 17, non-root runtime, `prod`, and `${PORT:8080}` | Dockerfile/root target `lms`; `SPRING_PROFILES_ACTIVE=prod`; platform `PORT`; intended deployed revision |
| Secrets and CORS | JWT requires a secret; production requires explicit DB and CORS targets | Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (at least 32 bytes), `CORS_ALLOWED_ORIGINS`; optional `JWT_EXPIRATION_MS` and `FRONTEND_URL`. CORS entries are exact frontend origins, no wildcard/path; never put backend secrets in `VITE_*` |
| Neon | Datasource is external; Flyway enabled; Hibernate `validate`; production pool max 5/min idle 1 | `DB_URL` is `jdbc:postgresql://HOST/DATABASE?sslmode=require` (or correctly configured `verify-full`); credentials separate; intended production database/branch; inspect settings only, no SQL |
| Startup | Health endpoints are minimal and public; no Actuator dependency | Render health path `/health/ready`; existing startup logs show `prod`, Flyway validation/applied versions through V7, successful Hibernate initialization and listening on `PORT`, without migration/schema errors |

No new deployment configuration blocker was found under these settings. Repository
review does not establish that the hosted deployments contain the current changes.
Record both deployed revisions before interpreting any smoke-test result.

## Hosted read-only checklist

Use existing authorized accounts and existing article fixtures. Do not register,
create/save/submit articles, confirm moderation, restart services, or run migrations.
Perform login only through the normal UI with an existing account; the inspected
login service issues JWTs without changing application records. Never copy JWTs,
passwords, private content, or full authorization headers into reports/screenshots.
Record each row as PASS/FAIL/BLOCKED, with time, deployed revisions, and redacted
status/error evidence. Missing fixtures are BLOCKED, not a pass.

| Check | Expected result |
|---|---|
| `GET {API}/health` and `GET {API}/health/ready`, no token | Both 200 with only `{"status":"UP"}`. A persistent readiness 503 or timeout blocks acceptance; inspect existing Render logs, do not restart to test |
| Open frontend `/`, `/courses`, `/articles` as guest | Pages load; public article request goes to the HTTPS Render API and returns JSON; no mixed-content, CORS, or asset-load errors |
| Direct navigation **and refresh** on `/articles/{existing-slug}`, `/my-articles`, `/articles/create`, `/articles/edit/{owned-id}`, `/admin/articles`, `/admin/articles/{id}`, `/admin/articles/new` | Frontend HTML loads; correct page or role/login redirect; lazy editor chunk loads successfully when authorized |
| Existing static asset and missing `/assets/not-present.js`; frontend `/api/not-present` | Real asset returns correct content type; missing asset/API path is not rewritten to SPA HTML (normally 404). The frontend origin is not an API proxy |
| `GET {API}/api/public/articles?page=0&size=1` and `/api/public/articles/{existing-slug}`, no token | 200 JSON, stable pagination envelope (`content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`); detail contains published fields, no rejection/private working fields |
| Missing public slug; existing archived slug if available | 404 with no private content; archived record absent from public listing |
| CORS preflight `OPTIONS {API}/api/articles/my`, with `Origin: {UI}`, `Access-Control-Request-Method: GET`, `Access-Control-Request-Headers: authorization` | Successful preflight, exact `Access-Control-Allow-Origin: {UI}`, credentials allowed and authorization accepted. Public GET from the same origin succeeds in the browser too |
| Same preflight from `https://not-allowed.invalid` | Denied (normally 403), with no allow-origin grant to that origin. Do not change CORS settings as part of this audit |
| `GET {API}/api/articles/my` and `/api/admin/articles`, no token; `GET /api/auth/me` with invalid/expired token | 401, never article data. Use only safe GET requests for API authorization checks |
| Login as existing author; refresh in the same tab; logout | `/api/auth/me` verifies JWT; refresh restores session from sessionStorage; logout clears it and protected routes redirect. Cold-start failure shows feedback; a stored token can be retried on reload |
| Existing author: `/my-articles`, owned edit page, create page | Existing content loads into editor; formatting and preview switching work. Make only **unsaved** local edits; preview must not save or change public content; leave without Save/Submit/Publish |
| Existing STUDENT/INSTRUCTOR: open admin route and `GET /api/admin/articles` with their session | UI redirects to dashboard; API returns 403. Another author's `GET /api/articles/{id}/manage` returns 404 without content |
| Existing ADMIN: `/admin/articles`, status filters, pagination, review page | List and pending queue load; author/status/dates are coherent. Existing pending updates show working and published versions separately; refresh preserves server state |
| ADMIN confirmation/rejection dialogs | Open then **cancel**. Focus/labels and archive visibility explanation are present. Do not confirm any action or send a rejection |
| Existing rejected article as its author | Reason visible in personal management; previously published snapshot remains publicly accessible if not archived |
| Public formatting and safe rendering | Existing headings, links, images, lists, underline/strike render correctly. No script/event markup is inserted by renderer. Do not inject security payloads into production records |
| Browser-local offline/request blocking or throttling on GETs only | Loading and error states remain visible, retry/reload works, no stale private content or silent blank screen. Restore local network settings afterward; do not simulate faults on hosted services |

## Writes and restart verification — deferred

Use an isolated staging database and test accounts for these workflows. They are
**not authorized production actions under this audit**:

- Draft create → save/reload → submit → approve → public snapshot.
- Reject with meaningful reason (1–2,000 characters) → author sees reason → edit
  and resubmit → approve. Check blank/over-limit validation.
- Edit published content → pending update; old public content remains unchanged;
  reject keeps it; subsequent approval replaces it.
- ADMIN direct publish; non-admin direct-publish attempts denied; archive removes
  public visibility while preserving authorized management access.
- Throttle writes and double-click to confirm one mutation per operation; verify
  list/review state after success and refresh. Do not automatically retry writes
  whose result is unknown.

For production persistence, compare existing record IDs/slugs and published
snapshots with evidence from before/after an **independently scheduled** backend
restart, using only authorized GETs. Also check retained private management data
without exporting it. Do not trigger a restart here: normal startup can run Flyway.
If historical evidence or a scheduled event is unavailable, persistence across
restart remains BLOCKED; current readiness alone cannot prove it.

## Acceptance and remaining risks

- Do not mark hosted verification complete until health, auth/CORS, nested routes,
  public snapshots, and role boundaries pass on the intended deployed revisions.
- Full author/moderation mutation verification and restart persistence remain
  deferred unless supported by staging results and existing restart evidence.
- Known limits: cold starts/readiness waits, concurrent moderation/slug allocation,
  full-HTML management payloads and the 4,000-record personal-list cap.
- Local H2 tests do not prove Neon/PostgreSQL compatibility. Existing hosted startup
  logs must confirm Flyway and Hibernate success; no manual migrations here.
- API URL validation permits HTTP; exact HTTPS production values require manual
  checking. No secret values should be recorded in the verification log.
