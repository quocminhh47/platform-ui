# platform-ui — development status

Snapshot for continuing on a new machine. **Source code and tests are the source of truth.**
Last verified: `npm test` → **121 passed**; `npm run lint` (oxlint) clean after recent learning hooks fix.

## Git (informational)

- Typical feature branch: `feat/enrollment-registration` (tracks `origin`).
- Run `git status` locally; doc updates may be uncommitted.

## Current project status

Standalone Vite SPA wired to the LMS backend. Public catalog, auth (register/login),
course detail with enrollment, my courses, dashboard shell, and **learning workspace**
with curriculum sidebar, external video/article embeds, and **auto-complete** progress
for VIDEO/ARTICLE after content loads.

## Recently completed

- Registration: split first/last name, phone, date of birth; server validation mapping.
- Login redesign; identifier = email or phone; `buildLoginRequestBody` legacy `email` mirror.
- Enrollment panel on course detail + toast; `MyCoursesPage` via `GET /api/enrollments/me`.
- Learning workspace: lesson content fetch, progress fetch/map, auto `POST .../progress/complete`.
- Catalog/home price display via shared `formatPrice` (Vietnamese).

## Routes (`src/app/router.tsx`)

| Route | Access | Feature |
|-------|--------|---------|
| `/` | Public | Home + published courses |
| `/courses` | Public | Catalog |
| `/courses/:courseId` | Public | Detail, curriculum preview, enroll |
| `/login`, `/register` | Guest only | Auth |
| `/account` | Auth | Placeholder account (HomePage) |
| `/courses/:courseId/learn/:lessonId?` | Auth | Learning workspace |
| `/dashboard` | Auth | Dashboard layout |
| `/my-courses` | Auth | Enrolled courses |

## API integration (implemented)

| Client module | Backend |
|---------------|---------|
| `features/auth/api/auth.api.ts` | `/api/auth/register`, `/login`, `/me` |
| `features/catalog/api/courses.api.ts` | `GET /api/courses?published=true`, course by id, sections/lessons |
| `features/enrollment/api/enrollments.api.ts` | POST enroll, GET my enrollments |
| `features/learning/api/lessons.api.ts` | Lesson with content (when enrolled) |
| `features/learning/api/progress.api.ts` | Course + lesson progress, complete |

Assumptions:

- 401 on `/me` clears token; user sent to login when hitting protected routes.
- Paid courses (`price > 0`) show formatted price but enroll fails with backend 400 (MVP).
- QUIZ/ASSIGNMENT lessons render unsupported/placeholder UI; progress complete is not auto-called.

## UI conventions

- Course cards: thumbnail, title, price via `formatPrice`, line-clamp styles in `src/styles/index.css`.
- Learning: YouTube nocookie embed, direct MP4, Google Docs/Drive article preview (`externalContentUrl` utils).
- Dashboard stats/activity sections are largely **presentational** (not backed by aggregate APIs yet).

## Known issues

- **Backend must be current** on `:8080` (restart after pull). Stale backend → login 400 or progress 404.
- **CORS**: use dev port **5173** or add your Vite port to backend `CORS_ALLOWED_ORIGINS`.
- **Reference assets**: `ui-references/stick/login-resource/` is design reference only, not bundled automatically.

## Not implemented / deferred

- Quiz taking, assignment submit, certificates, payment checkout.
- Admin/instructor course authoring UI.
- Password reset, email verification, refresh tokens.
- Real dashboard metrics from server (enrollment counts, activity feed APIs absent).

## Next recommended tasks

1. **Quiz lesson UX** — once backend exposes attempt APIs; wire lesson stage + progress rules from business-rules §4–§6.
2. **Dashboard data** — replace placeholders when backend provides activity/stats endpoints (or scope MVP removal).
3. **Paid course UX** — hide or disable enroll when `price > 0` until payment exists (optional polish).

Dependencies: backend quiz APIs for (1); backend or product decision for (2).

## Environment

`.env` from `.env.example`:

- `VITE_API_BASE_URL` — no trailing slash; no secrets.

## Commands

```bash
cp .env.example .env && npm install
npm run dev          # http://localhost:5173
npm run lint
npm test
npm run build
```

Backend start (from `lms/`): see `lms/docs/architecture.md` or `docs/frontend.md`.
