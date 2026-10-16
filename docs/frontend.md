# Frontend development (platform-ui)

Standalone LMS UI: **Vite + React + TypeScript**. The Spring Boot API lives in a
**sibling** project (`lms/`), not inside this tree.

## Prerequisites

- Node.js **20+** and npm
- Backend at `http://localhost:8080` with Postgres and Flyway applied (see `lms/docs/architecture.md`)

## Start the backend (sibling repo)

From `lms/`:

```bash
docker compose up -d
cp .env.example .env   # set DB_*, JWT_*, POSTGRES_PASSWORD, CORS_ALLOWED_ORIGINS
set -a && source .env && set +a
./mvnw spring-boot:run
```

Optional demo courses: `lms/scripts/seed/README.md`.

## Start this frontend

From `platform-ui/`:

```bash
cp .env.example .env
npm install
npm run dev
```

Default dev URL: **http://localhost:5173** — add this origin to backend `CORS_ALLOWED_ORIGINS`.

## Environment variables (names only)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend base URL (no trailing slash), e.g. `http://localhost:8080` |

Read in code: `import.meta.env.VITE_API_BASE_URL` (`src/services/api/client.ts`).
Do **not** put JWT secrets or database passwords in frontend env files.

## Authentication

1. **Register** `POST /api/auth/register` — body includes `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `dateOfBirth`.
2. **Login** `POST /api/auth/login` — UI sends `identifier` (email or phone) and `password` via `buildLoginRequestBody()` (`src/features/auth/api/login-request.ts`). When the identifier looks like an email, the same value is also sent as `email` for older backends.
3. Response: `{ accessToken, tokenType, expiresInMs }`. Store **only** the access token in sessionStorage (`src/services/api/token-storage.ts`).
4. Protected calls: `Authorization: Bearer <accessToken>` (`apiRequest` in `client.ts`).
5. **Bootstrap**: `AuthProvider` loads the user once with `GET /api/auth/me` (`auth.api.ts`).
6. **Routes**: `GuestRoute` for `/login` and `/register`; `ProtectedRoute` for learning, dashboard, my courses, and `/account`.
7. On **401** while restoring session, the token is cleared. Backend authorization remains authoritative for enrollment and lesson content.

## Routes and features

Defined in `src/app/router.tsx`:

- **Public**: `/`, `/courses`, `/courses/:courseId` — published catalog and detail (curriculum metadata without full content URLs for guests).
- **Guest**: `/login`, `/register`.
- **Authenticated**:
  - `/courses/:courseId/learn/:lessonId?` — learning workspace (video/article embeds, sidebar progress).
  - `/my-courses` — enrollments from `GET /api/enrollments/me`.
  - `/dashboard` — layout and sections (mostly static/placeholder metrics).
  - `/account` — currently reuses home page shell.

**Enrollment**: course detail `CourseEnrollmentPanel` → `POST /api/courses/{courseId}/enrollments` (free published courses only).

**Progress**: `useCourseProgress` + `progress.api.ts`; VIDEO/ARTICLE auto-complete via `POST .../lessons/{lessonId}/progress/complete` after embed/video load (see `VideoLesson`, `ArticleLesson`, `LearningWorkspacePage`).

## External lesson content

`src/features/learning/utils/externalContentUrl.ts` supports:

- YouTube (watch/youtu.be/embed/shorts → privacy-enhanced embed)
- Direct HTTPS video (e.g. MP4)
- Google Drive file / Google Docs preview for articles
- Fallback external link when embed is unsafe or unsupported

Full `contentUrl` requires enrollment (`ACTIVE`/`COMPLETED`) or ADMIN on the backend.

## Pricing display

`src/features/catalog/utils/formatPrice.ts`:

- `price <= 0` or invalid → **Miễn phí**
- Otherwise `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`

Used on home cards, catalog cards, and course detail.

## Project structure

- `src/app/` — router, app shell
- `src/features/auth/` — forms, validation, API, tests
- `src/features/catalog/` — list, detail, curriculum hooks
- `src/features/enrollment/` — enroll API, my courses
- `src/features/learning/` — workspace, progress, lesson APIs
- `src/features/dashboard/` — dashboard pages and components
- `src/services/api/` — shared HTTP + token storage

## Production build

```bash
npm run build
```

Output: `dist/`

## Quality checks

```bash
npm run lint    # oxlint
npm test        # vitest run (121 tests)
npm run build   # tsc -b && vite build
```

## Cursor multi-root workspace

Open both folders in one window (File → Add Folder to Workspace):

- `/path/to/lms`
- `/path/to/platform-ui`

Save a `.code-workspace` file outside either Git repo if desired. Do not nest the UI inside the backend tree.

## Related docs

- `AGENTS.md` — agent conventions
- `docs/development-status.md` — status, gaps, next tasks
- `lms/docs/business-rules.md` — enrollment, gating, progress rules
