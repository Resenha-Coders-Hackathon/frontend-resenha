# Project Guide

Vue 3 + TypeScript frontend for the hackathon (ResenhaCoders). Talks to the Django REST
backend (JWT in **HttpOnly cookies**), organized by domain modules.

Read this first, then [`CONVENTIONS.md`](CONVENTIONS.md) for naming and style,
[`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md) for how we split work and review, and
[`MODULES.md`](MODULES.md) for the module inventory. `AGENTS.md` / `CLAUDE.md` hold the rules
for AI agents.

---

## 1. Stack

| Piece | Choice |
|-------|--------|
| Language | TypeScript ~6.0 |
| Framework | Vue 3.5 (`<script setup>`, SFC) |
| Build | Vite 8 (`@` alias → `src/`) |
| Routing | vue-router 5 |
| State | Pinia |
| HTTP | axios only, through the shared `api` instance (`src/app/plugins/axios.ts`). **Never `fetch`** |
| Styling | Tailwind CSS 4 (theme tokens in `src/assets/main.css`, `dark` class variant) |
| Maps | mapbox-gl + draw + geocoder |
| Toasts | vue3-toastify |
| PWA | vite-plugin-pwa (`registerType: autoUpdate`) |
| Lint / format | oxlint + ESLint + Prettier (no semicolons, single quotes, width 100) |
| Package manager | npm (`package-lock.json` is the source of truth) |
| Node | `^22.18.0 \|\| >=24.12.0` |
| Tests | Vitest + `@vue/test-utils` + jsdom (**adopted as the standard, not installed yet**; no `test` script until then) |

## 2. Running locally

```bash
npm install
npm run dev          # vite dev server
npm run type-check   # vue-tsc --build
npm run lint         # oxlint --fix + eslint --fix
npm run format       # prettier --write src/
npm run build        # type-check + vite build
```

The backend runs separately (see `Backend/docs/PROJECT_GUIDE.md`). Requests must be sent
**with credentials** (`withCredentials: true` in axios) so the HttpOnly cookies travel, and
cookie-authenticated writes must send the `X-CSRFToken` header with the `csrftoken` cookie.

## 3. Folder structure

```
src/
  main.ts                # createApp + Pinia + router + toastify
  App.vue
  assets/main.css        # Tailwind import + @theme tokens (colors, font)
  app/                   # global wiring only
    router/index.ts      # merges every module's routes
    layouts/             # DefaultLayout.vue
    plugins/             # axios.ts (`api` instance + interceptors + getErrorMessage)
    composables/         # app-wide composables (useTheme)
  modules/               # one folder per domain
    index.ts
    auth/                # login, register, session store
    module/              # home, 404
    geolocation/ mapbox/ notifications/ payments/   # in feature branches; any new domain follows the same layout
      components/ composables/ router/ services/ stores/ types/ utils/ views/
  shared/                # genuinely reusable, domain-free code
    components/{buttons,forms,general}/   # each folder has an index.ts barrel
    composables/ styles/ services/ directives/ types/ utils/   # created when first needed
src/firebaseConfig.ts    # Firebase init for push notifications (reads VITE_* vars)
public/                  # static assets (login.svg, register.svg)
docs/                    # this guide, conventions, workflow, module inventory
.github/                 # CI, PR template, issue template, CODEOWNERS
AGENTS.md / CLAUDE.md    # rules for AI agents working in the repo
```

### What goes where (rules)

| Folder | Put here | Never put here |
|--------|----------|----------------|
| `views/` | Page components bound to a route; compose components, call stores/services | Reusable widgets, raw HTTP calls |
| `components/` (module) | UI used only inside that module | Components another module needs (move to `shared`) |
| `shared/components/` | Domain-free UI (buttons, inputs, header) | Anything importing from `modules/` |
| `services/` | HTTP calls to the backend, one file per subject; return typed data | Vue refs, UI/toasts |
| `stores/` | Pinia stores: state shared across views; call services | HTTP details, markup |
| `composables/` | Reusable reactive logic (`useX`) | Global singletons without a reason |
| `types/` | TypeScript interfaces/types for that scope (`I<Name>`) | Runtime code |
| `utils/` | Pure, stateless helpers | Anything needing Vue or stores |
| `router/` | The module's `RouteRecordRaw[]`, exported as `<module>Routes` | Guards that affect other modules |
| `app/` | Bootstrapping, layouts, plugins, global composables | Domain logic |
| `messages` / copy | User-facing text lives in the view/component | Hard-coded API URLs |

Each folder has an `index.ts` barrel: import from the barrel
(`@/shared/components`, `../components`), never from a sibling module's internals.

### Adding a feature: checklist

1. Branch `feat/<kebab-name>` from `dev`; open the PR into `dev` (never commit to `main`).
2. Types in `modules/<m>/types/` mirroring the backend serializer (snake_case keys from the API).
3. Service in `services/<subject>.ts` (the only place that calls the backend), using the
   shared `api` instance with a typed request/response (`api.get<User>(...)`). No `fetch`, no
   new `axios.create` for the backend. Errors go through `getErrorMessage(error, fallback)`.
4. Store in `stores/<subject>.ts` if state is shared between views.
5. View in `views/<Name>View.vue`, components in `components/`; export them from the `index.ts` barrels.
6. Route in `modules/<m>/router/index.ts` (kebab-case path, `name` in PascalCase); the module's
   routes are already spread in `app/router/index.ts` — register a **new** module there and in `modules/index.ts`.
7. Reuse `shared/components` before creating new UI; use the Tailwind tokens from `main.css`
   and support the `dark:` variant.
8. A test for any non-trivial logic (see [Testing](#testing)).
9. `npm run type-check && npm run lint && npm run format` (and `npm run test` once the runner exists).

### Testing

Standard: **Vitest** with `@vue/test-utils` and `jsdom`. Tests live next to the code they cover,
in `__tests__/` of the same module (`src/modules/<m>/__tests__/<subject>.spec.ts`;
`src/shared/**/__tests__/` for shared code), one file per subject.

| Test | What to cover | How |
|------|---------------|-----|
| `services/` | Correct URL/method/payload, typed result, error → `getErrorMessage` message | Mock the `api` instance (`vi.mock('@/app/plugins/axios')`); never hit the real backend |
| `stores/` | State changes and actions (`signIn`, `signOut`, ...) | `setActivePinia(createPinia())`, mock the service |
| `composables/`, `utils/` | Pure logic and edge cases | Call directly |
| Components (`shared` or module) | Props, `v-model`, emitted events, conditional rendering | `mount()` from `@vue/test-utils` |
| Router guards | `requiresAuth` redirect to `/entrar` | Mock the auth store |

Rules: a test is required for any non-trivial logic; test names describe behavior
(`it('redirects to /entrar when the session is invalid')`); no network, no real timers or
cookies; do not test styling.
When the runner is added: `npm install -D vitest @vue/test-utils jsdom`, add `"test": "vitest run"`
to `package.json`, and add an `npm run test` step to `.github/workflows/frontend-ci.yml`.

## 4. Authentication (how the frontend uses it)

The backend sets `access_token` (15 min) and `refresh_token` (1 day) as HttpOnly cookies
on `POST /api/v1/login/`; JavaScript never reads them.

- Send every request with credentials; send `X-CSRFToken` on writes.
- On `401` from a protected call, try `POST /api/v1/refresh/` once, then retry; if it fails,
  clear the auth store and go to `/entrar`.
- Public auth routes: `/entrar` (Login) and `/registrar` (Register), under `DefaultLayout`.
- Registration, password reset and e-mail change are **request → verify → confirm** with a
  6-digit code (15 min, 5 attempts). Build the UI as three steps.
- Google login: `POST /api/v1/login/google/` with the Google ID token (`GoogleButton`).

> Status on this branch: login/register screens are UI only and the axios plugin is empty.
> The implementation (`api` instance, auth service/store, `requiresAuth` route guard) lives in
> `feat-login` and is the reference for the rules above. Routes needing a session set
> `meta: { requiresAuth: true }`; the guard in `app/router` loads the user via `GET /users/me/`.

### HTTP client rules

- One client: `api` from `@/app/plugins/axios`. It already sets `baseURL` (`VITE_API_BASE_URL`),
  `withCredentials`, the CSRF header and the 401 → `POST /refresh/` → retry flow. Do not
  re-implement any of that in a service, and never read `document.cookie` by hand.
- Type everything: a `Request` interface for payloads, a response type in `types/` for data,
  and `Promise<T>` return types on service functions. No `any`.
- Services throw `Error` with a user-readable message; stores/views decide how to show it (toast).
- Exception: public third-party APIs (e.g. CEP, routing) may use their own small axios instance
  in `shared/services/`, with a timeout. They never receive the backend cookies.

## 5. Business rules the UI must respect

- Login is by **e-mail**; user ids are **UUIDs** (treat as `string`).
- Users are never deleted, only deactivated.
- Password: minimum 9 characters; show the backend's validation errors (`detail`).
- Password reset always answers "code sent", even for unknown e-mails: don't try to detect it.
- Backend messages arrive as `{"detail": "..."}`; show them via toast, don't hard-code copy for them.

## 6. Environment

- Variables are read through `import.meta.env` and must start with `VITE_`:
  `VITE_API_BASE_URL` (backend URL, e.g. `http://localhost:8000/api/v1`), Firebase (`VITE_API_KEY`,
  `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`,
  `VITE_APP_ID`, `VITE_MEASUREMENT_ID`), and any Mapbox/Google ids.
- `.env` is git-ignored: document every new variable in the committed `.env.example`.
- Never put secrets in the frontend; anything `VITE_*` is public.

## 7. Known issues

| Issue | Where | Fix |
|-------|-------|-----|
| PWA manifest has empty `id`/`name`/`short_name`/`description` and points to `/icons/hackathon*.png`, which are not in `public/` | `vite.config.ts` | Fill the manifest and add the icons |
| `axios.ts` plugin is empty and `auth` has no service/store on this branch | `src/app/plugins`, `modules/auth` | Merge `feat-login` |
| `feat-notifications` / `feat/payments` call the backend with `fetch` and read the CSRF cookie manually | `modules/notifications/services` | Switch to `api` once `feat-login` is merged |
| Vitest is the documented standard but is not installed; no `test` script, no tests, CI does not run them | `package.json`, CI | Follow the Testing section above |
| Empty stub files (`index.ts`, `axios.ts`) are part of the modular pattern | `.oxlintrc.json` | `unicorn/no-empty-file` is turned off so the stubs pass lint |
| Module named `module` is a generic name (holds Home/404) | `src/modules/module` | Rename (e.g. `home`) when agreed |
| `.gitignore` contains a stray `*.` line; `.serena/` is untracked | `.gitignore` | Remove the line; ignore `.serena/` |
