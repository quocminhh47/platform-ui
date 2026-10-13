# Frontend development (platform-ui)

Standalone LMS UI: Vite + React + TypeScript in this repository (`platform-ui`).
The Spring Boot API lives in a **sibling** project (typically `lms/`), not inside this tree.

## Prerequisites

- Node.js 20+ and npm
- Backend running at `http://localhost:8080` (see the backend repo’s `docs/`, `.env.example`, and `docker-compose.yml`)

## Start the backend (sibling repo)

From the backend project root (for example `../lms`):

```bash
docker compose up -d   # optional Postgres
# Spring Boot does not load .env automatically; quote special chars in .env values.
set -a && source .env && set +a
./mvnw spring-boot:run
```

API default: `http://localhost:8080`

## Start this frontend

From this repository root:

```bash
cp .env.example .env
npm install
npm run dev
```

Dev server default: `http://localhost:5173` (must be listed in the backend `CORS_ALLOWED_ORIGINS`).

## API base URL

`.env` (from `.env.example`):

```properties
VITE_API_BASE_URL=http://localhost:8080
```

Read in code via `import.meta.env.VITE_API_BASE_URL` (`src/api/client.ts`).
Do not put JWT secrets or database passwords in frontend env files.

## Authentication (once login is implemented)

1. `POST /api/auth/register` or `POST /api/auth/login` returns `{ accessToken, tokenType, expiresInMs }`.
2. Store **only** the access token (see `src/auth/tokenStorage.ts` — sessionStorage, never passwords).
3. Send `Authorization: Bearer <accessToken>` on protected requests (`apiRequest` supports `accessToken`).
4. Load the current user with `GET /api/auth/me` (`src/api/auth.ts` → `fetchCurrentUser`).
5. On 401, clear the token and send the user to login.
6. UI role checks are for navigation only; the backend enforces authorization.

## Production build

```bash
npm run build
```

Output: `dist/`

## Cursor multi-root workspace

Open both folders in one window (File → Add Folder to Workspace…), for example:

- `/path/to/lms` (backend)
- `/path/to/platform-ui` (this app)

Save as a `.code-workspace` file **outside** either Git repo (or only in a repo you intentionally own). Do not nest the UI inside the backend tree.
