# platform-ui

Standalone React + TypeScript + Vite frontend for the LMS.

- API base URL: `VITE_API_BASE_URL` (default `http://localhost:8080`)
- Architecture: `app/` (shell + router), `features/auth/` (auth UI + API), `services/api/` (HTTP + token storage)
- Dev docs: [docs/frontend.md](docs/frontend.md)

```bash
cp .env.example .env
npm install
npm run dev
```

Routes include `/`, `/courses`, `/courses/:courseId`, `/login`, `/register`, `/my-courses`, `/dashboard`, and `/courses/:courseId/learn/...`. See [docs/frontend.md](docs/frontend.md) and [docs/development-status.md](docs/development-status.md).

```bash
npm run lint && npm test && npm run build
```
