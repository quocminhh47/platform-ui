# AGENTS.md — platform-ui

Instructions for coding agents on the LMS **frontend** (Vite + React 19 + TypeScript).
The Spring Boot API lives in the sibling **`lms`** repository.

## Stack

- Node.js **20+**, npm
- Vite 8, React 19, React Router 7
- Vitest + Testing Library; **oxlint** for lint (`npm run lint`)
- No global state library; React context for auth

## Repository layout

```
platform-ui/
  src/
    app/              # router, providers
    components/       # shared layout (AppShell, …)
    features/         # auth, catalog, dashboard, enrollment, learning
    pages/            # Home and thin page wrappers
    services/api/     # HTTP client, token storage
  docs/frontend.md
  docs/development-status.md
  .env.example        # VITE_API_BASE_URL only
```

Prefer **feature folders** (`features/<name>/`) with colocated API, hooks, components, and tests.

## Conventions

- API base: `import.meta.env.VITE_API_BASE_URL` via `src/services/api/client.ts`.
- JWT: store access token in **sessionStorage** only (`token-storage.ts`); never store passwords.
- Protected routes: `ProtectedRoute` / `GuestRoute` in `src/features/auth/components/`.
- Vietnamese copy for user-visible price labels: `formatPrice()` → `"Miễn phí"` or `vi-VN` VND.
- Login body: `buildLoginRequestBody()` sends `identifier` + `password`; mirrors `email` when identifier contains `@` for legacy backends.

## Backend coupling

- Default API: `http://localhost:8080`
- Dev server: `http://localhost:5173` — must appear in backend `CORS_ALLOWED_ORIGINS`.
- Restart backend after API contract changes; stale `:8080` processes cause confusing 400/404.

## Verification

```bash
npm install
npm run lint
npm test
npm run build
```

Currently **121** Vitest tests when run with `npm test`.

## Documentation

| File | Use |
|------|-----|
| `docs/frontend.md` | Setup, routes, auth, feature integration |
| `docs/development-status.md` | Implemented UI, gaps, next steps |
| `README.md` | Quick start |

Product rules for enrollment, progress, and gating: **`lms/docs/business-rules.md`**.

## Scope discipline

- Do not add backend code here or nest this repo inside `lms/`.
- Do not put secrets in `.env` committed to Git; only `VITE_*` public config.
- Quiz/assignment UX beyond placeholders should wait for backend quiz APIs unless the task says otherwise.
