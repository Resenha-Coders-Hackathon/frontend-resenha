# Project Guide

<<<<<<< HEAD
Vue 3 + TypeScript SPA (installable PWA) template for the ResenhaCoders hackathon.
It ships a neutral black/white UI kit, routing by module, push notifications
(Firebase Cloud Messaging), maps (Mapbox) and browser geolocation, and talks to
the Django REST backend in `../backend-resenha`.

Read this first, then [`CONVENTIONS.md`](CONVENTIONS.md) for naming and style,
[`COMPONENTS.md`](COMPONENTS.md) for the shared UI kit and
[`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md) for how we split work and review.
=======
Vue 3 + TypeScript frontend for the hackathon (ResenhaCoders). Talks to the Django REST
backend (JWT in **HttpOnly cookies**), organized by domain modules.

Read this first, then [`CONVENTIONS.md`](CONVENTIONS.md) for naming and style,
[`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md) for how we split work and review, and
[`MODULES.md`](MODULES.md) for the module inventory. `AGENTS.md` / `CLAUDE.md` hold the rules
for AI agents.
>>>>>>> 57b8c5a (docs: add project guide, conventions, team workflow, modules, agent rules and CI)

---

## 1. Stack

| Piece | Choice |
|-------|--------|
<<<<<<< HEAD
| Framework | Vue 3.5 (`<script setup lang="ts">`, Composition API only) |
| Language | TypeScript 6 (`strict`, `noUncheckedIndexedAccess`) |
| Build | Vite 8, alias `@` → `src/` |
| Routing | Vue Router 5, HTML5 history, lazy-loaded views |
| State | Pinia 4 (setup stores) |
| HTTP | Axios installed; `src/app/plugins/axios.ts` is still empty (see Known issues) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + CSS tokens in `src/assets/main.css` |
| Utilities | `@vueuse/core` (`useWindowSize` in `useScreenSize`) |
| Icons | Google Material Symbols Outlined (font, loaded in `index.html`) |
| Font | Plus Jakarta Sans (Google Fonts, imported in `main.css`) |
| Toasts | `vue-sonner` (`<Toaster />` in `App.vue`, `toast()` anywhere) |
| Push | `firebase` 13 (Cloud Messaging + Analytics) |
| Maps | `mapbox-gl`, `@mapbox/mapbox-gl-geocoder`, `@mapbox/mapbox-gl-draw` |
| PWA | `vite-plugin-pwa`, `injectManifest` with a custom service worker |
| Lint / format | oxlint + ESLint (`eslint-plugin-vue`), Prettier |
| Node | `^22.18.0` or `>=24.12.0` |
=======
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
>>>>>>> 57b8c5a (docs: add project guide, conventions, team workflow, modules, agent rules and CI)

## 2. Running locally

```bash
npm install
<<<<<<< HEAD
# create .env with the variables in section 6 (there is no .env.example yet)
npm run dev              # http://localhost:5173 (the backend allows this origin in CORS)
npm run type-check       # vue-tsc --build
npm run lint             # oxlint --fix, then eslint --fix
npm run format           # prettier on src/
npm run build            # type-check + vite build
npm run preview          # serve the build
```

The backend must be running (`pdm run dev` in `../backend-resenha`) for any API call.
Push notifications only work on `localhost` or HTTPS.

## 3. Architecture

The code is split in three layers. Dependencies only point **downwards**:

```
modules/<feature>   →   shared/   →   (nothing in the project)
        ↓
      app/          (app/ imports modules' routes; modules may import app/plugins and app/layouts)
```

- **`app/`** — application shell: router, HTTP client, layouts, global composables (theme).
- **`modules/`** — one folder per business feature. A module never imports from
  another module; shared code moves to `shared/` (`mapbox` → `geolocation` is the
  current exception, see Known issues).
- **`shared/`** — feature-agnostic building blocks: UI kit, composables, types, utils.
- **`src/firebase.ts` / `src/firebaseConfig.ts`** — Firebase app and config, used by
  the `notifications` module and by the service worker.
- **`service-worker/sw.ts`** — custom service worker (Workbox precache + FCM background messages).

Boot sequence (`src/main.ts`): import `main.css`, `vue-sonner` and Mapbox CSS →
`createApp(App)` → Pinia → router → mount on `#app`. `App.vue` renders
`<RouterView />` and `<Toaster />`; every page is wrapped by a layout chosen in the route.

## 4. Folder structure

```
index.html               # mount point, <title>, Material Symbols stylesheet
vite.config.ts           # plugins (vue, devtools, tailwind, PWA), alias @
service-worker/sw.ts     # custom SW: precache + Firebase onBackgroundMessage
public/                  # static files served at / (icons/, login.svg, register.svg)
src/
  main.ts                # app bootstrap (plugins, global CSS)
  App.vue                # <RouterView /> + <Toaster />
  firebase.ts            # initializeApp, analytics, getFirebaseMessaging()
  firebaseConfig.ts      # config read from VITE_* env, throws if one is missing
  assets/main.css        # Tailwind import, design tokens (@theme), dark variant, base typography
  app/
    router/index.ts      # createRouter; spreads every module's routes
    plugins/axios.ts     # HTTP client (empty for now)
    layouts/             # page shells (DefaultLayout: header + <main><RouterView /></main>)
    composables/         # app-wide state (useTheme)
  modules/
    <feature>/
      router/index.ts    # export const <feature>Routes: RouteRecordRaw[]
      views/             # <Name>View.vue, one per route
      components/        # components used only by this module + index.ts barrel
      composables/       # use<Name>() hooks / browser API wrappers for the module
      services/          # API calls for this module
      stores/            # Pinia store(s) for this module
      types/             # interfaces for this module (API payloads, entities)
      utils/             # pure helpers for this module
    module/              # template/base module: Home + 404. Copy it to start a new module
    auth/                # login/register routes (views are empty placeholders)
    geolocation/         # useGeolocationStore: watchPosition → latitude/longitude
    mapbox/              # MapboxComp: 3D map, terrain, geocoder search
    notifications/       # FCM token, foreground messages, test push via backend
  shared/
    components/          # UI kit, grouped: buttons/, forms/, general/ (barrel per group)
    composables/         # useLoading, useScreenSize
    types/               # shared interfaces (IInputs, IMenuItems)
    utils/               # shared pure helpers
docs/                    # this guide, conventions, components, team workflow
AGENTS.md / CLAUDE.md    # rules for AI agents working in the repo
```

Every module keeps **all** seven subfolders with an `index.ts` (empty is fine), so
every module looks the same and imports never change shape.

=======
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

>>>>>>> 57b8c5a (docs: add project guide, conventions, team workflow, modules, agent rules and CI)
### What goes where (rules)

| Folder | Put here | Never put here |
|--------|----------|----------------|
<<<<<<< HEAD
| `views/` | Page composition: arrange components, bind store/composable state, handle submit | Raw HTTP calls, long logic, reusable UI |
| `components/` | UI pieces of this module, props in / events out | Direct HTTP calls |
| `composables/` | Reactive logic and browser/SDK wrappers (`requestDeviceFcmToken`) | Templates, global state that belongs in a store |
| `services/` | One async function per endpoint; turn HTTP errors into `Error` with a pt-BR message | Reactive state, toasts, router |
| `stores/` | State shared across views (`defineStore('<id>', () => {...})`) | HTTP details (call services), DOM access |
| `types/` | `interface` / `type` for entities and API payloads | Runtime code |
| `utils/` | Pure functions (format, mask, parse) | State, side effects |
| `shared/components/` | Generic UI with no business words (`BaseInput`, not `FreightInput`) | Module data, API calls, store usage |
| `shared/composables/` | Generic reactive helpers (`useLoading`, `useScreenSize`) | Feature logic |
| `app/` | Things every module needs exactly once (router, client, layout, theme) | Feature code |
| `public/` | Files referenced by absolute URL (`/icons/hackathon-192.png`) | Images imported by code (put in `assets/`) |

Data flow inside a module:

```
View  →  store / composable  →  service  →  HTTP  →  backend
  ↑            (reactive state)                         |
  └──────────────── re-render ←─────────────────────────┘
```

Feedback to the user goes through toasts in the view or component:

```ts
import { toast } from 'vue-sonner'
toast.success('Salvo!')
toast.error(error instanceof Error ? error.message : 'Algo deu errado.')
toast('Título', { description: 'Corpo' })
```

### Adding a module: checklist

1. Branch `feat/<kebab-name>` from `dev`; open the PR into `dev`.
2. Copy `src/modules/module/` to `src/modules/<feature>/` and clear its views/components.
3. Types in `types/index.ts` (match the backend serializer, `snake_case` keys).
4. Service functions in `services/index.ts`.
5. Store in `stores/index.ts` (`use<Feature>Store`) if state is shared between views.
6. Views in `views/<Name>View.vue`, built from `@/shared/components` first.
7. Routes in `router/index.ts` as `<feature>Routes`, lazy imports, wrapped in a layout;
   import and spread them in `src/app/router/index.ts`.
8. New env vars → `.env` docs in section 6 (and `.env.example` once it exists), with the `VITE_` prefix.
9. `npm run type-check && npm run lint`, then check light **and** dark mode, mobile and desktop.

## 5. Routing

- `src/app/router/index.ts` builds the router from each module's array:
  `routes: [...moduleRoutes, ...authRoutes, ...geolocationRoutes, ...mapboxRoutes, ...notificationsRoutes]`.
  `scrollBehavior` returns to the top.
- Each module route array has a parent record that sets the **layout** and lists
  pages as `children`:

  ```ts
  export const mapboxRoutes: RouteRecordRaw[] = [
    {
      path: '/',
      component: () => import('@/app/layouts/DefaultLayout.vue'),
      children: [
        { path: '/mapbox', name: 'Mapbox', component: () => import('../views/HomeView.vue') },
      ],
    },
  ]
  ```

- Views are always lazy (`() => import(...)`).
- URL paths are **pt-BR, kebab-case** (`/entrar`, `/localizacao`); route `name` is
  **PascalCase English** (`Login`, `Geolocation`). Navigate by name when possible:
  `router.push({ name: 'Login' })`.
- The catch-all `/:pathMatch(.*)*` → `NotFound` lives in `modules/module`.
- Protected pages will use `meta: { requiresAuth: true }` with a global guard
  (implemented in the `feat-login` branch, not here yet).

Current routes:

| Path | Name | View |
|------|------|------|
| `/` | `Home` | `modules/module/views/HomeView.vue` (empty `HeroSection`) |
| `/entrar` | `Login` | `modules/auth/views/LoginView.vue` (empty) |
| `/registrar` | `Register` | `modules/auth/views/RegisterView.vue` (empty) |
| `/localizacao` | `Geolocation` | `modules/geolocation/views/HomeView.vue` |
| `/mapbox` | `Mapbox` | `modules/mapbox/views/HomeView.vue` |
| `/notificacoes` | `Notifications` | `modules/notifications/views/HomeView.vue` |
| `/*` | `NotFound` | `modules/module/views/NotFoundView.vue` |

## 6. Environment variables

All read with `import.meta.env.*`. Everything `VITE_*` ends up in the bundle:
never put a private secret here.

| Variable | Used by | Notes |
|----------|---------|-------|
| `VITE_API_BASE_URL` | `notifications/services` (and the future HTTP client) | e.g. `http://localhost:8000/api` |
| `VITE_MAPBOX_API_KEY` | `mapbox/components/mapboxComp.vue` | Mapbox public token |
| `VITE_API_KEY` | `firebaseConfig.ts` | Firebase web config |
| `VITE_AUTH_DOMAIN` | `firebaseConfig.ts` | |
| `VITE_PROJECT_ID` | `firebaseConfig.ts` | |
| `VITE_STORAGE_BUCKET` | `firebaseConfig.ts` | |
| `VITE_MESSAGING_SENDER_ID` | `firebaseConfig.ts` | |
| `VITE_APP_ID` | `firebaseConfig.ts` | |
| `VITE_MEASUREMENT_ID` | `firebaseConfig.ts` | Analytics |
| `VITE_VAPID_KEY` | `notifications/composables` | Web Push key from Firebase |

`firebaseConfig.ts` **throws** if any Firebase variable is missing; it is imported
by `service-worker/sw.ts` and by the notifications module.

## 7. Backend integration

Full contract: `../backend-resenha/docs/PROJECT_GUIDE.md` (section 4, Authentication).
What the frontend must respect:

- **Base URL** comes from `VITE_API_BASE_URL`. Never hard-code it.
- **Auth is by HttpOnly cookies** (`access_token` 15 min, `refresh_token` 1 day).
  JavaScript cannot read them: the only way to know if a user is logged in is to
  call `GET /users/me/`. Never store tokens in `localStorage`.
- Every request goes with credentials (`credentials: 'include'` / `withCredentials: true`).
- **CSRF**: writes (`POST/PUT/PATCH/DELETE`) send `X-CSRFToken` with the
  `csrftoken` cookie value (`notifications/services` reads it from `document.cookie`).
- **Refresh**: on a `401`, call `POST /refresh/` once and retry; if it fails, send
  the user to `/entrar`. `/login/` and `/refresh/` never trigger a refresh.
- Public backend views answer failed auth with **403**, not 401.
- Errors come as `{"detail": "..."}` or, for validation, `{"field": ["message"]}`.
- JSON keys are `snake_case`; keep them as-is in `types/` (no camelCase mapping).

Right now the only call is `notifications/services` (`POST /notifications/send/`),
done with `fetch`. The shared axios client with CSRF + refresh lives in the
`feat-login` branch (`api` + `getErrorMessage` in `src/app/plugins/axios.ts`);
once it is merged, new services should use it:

```ts
// src/modules/<feature>/services/index.ts
import { api, getErrorMessage } from '@/app/plugins/axios'
import type { Shipment } from '../types'

export async function fetchShipments(): Promise<Shipment[]> {
  try {
    return (await api.get<Shipment[]>('/shipments/')).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível carregar os envios.'))
  }
}
```

## 8. Feature modules

### Notifications (FCM)
1. `requestDeviceFcmToken()` checks browser support, HTTPS/localhost, `VITE_VAPID_KEY`,
   asks for `Notification` permission, waits for the service worker and returns
   `{ token, messaging }`.
2. `listenForForegroundMessages(messaging, cb)` shows messages while the tab is open
   (the component turns them into toasts); returns an unsubscribe function.
3. `sendNotification({ token, title, body })` asks the backend to push to that token.
4. With the tab closed, `service-worker/sw.ts` (`onBackgroundMessage`) shows the system notification.

### Geolocation
`useGeolocationStore()` → `startTracking()` (`navigator.geolocation.watchPosition`,
high accuracy) fills `latitude` / `longitude`; `stopTracking()` clears the watch.
Errors are swallowed for now.

### Mapbox
`MapboxComp` creates the map in `#map-fixed` (style `outdoors-v12`, pitch 60,
3D terrain, hillshade, 3D buildings from zoom 15) and adds a geocoder search box.
Centers on the geolocation store, falling back to Joinville (`-48.8464, -26.3044`).
Removes the map on unmount.

## 9. Styling and theme

- **Tailwind 4 only**, no component library. Design tokens are CSS variables in
  the `@theme` block of `src/assets/main.css` and are used with Tailwind's
  arbitrary-variable syntax: `bg-(--surface)`, `text-(--text-muted)`, `border-(--border-default)`.
- Tokens are **not** in Tailwind's `--color-*` namespace, so `bg-surface` does
  **not** exist. Always write `(--token)`.
- **Dark mode** is class-based: `@custom-variant dark (&:where(.dark, .dark *))`.
  `useTheme()` (`src/app/composables/useTheme.ts`) toggles `.dark` on `<html>`,
  saves `localStorage.theme` and falls back to `prefers-color-scheme`. Its state
  is module-level, so every caller shares it. Use `<ThemeSwitcher />` for the toggle.
- The palette is **neutral black/white**. Dark mode swaps a token for its
  `-inverse` twin: `bg-(--surface) dark:bg-(--surface-inverse)`,
  `text-(--text-primary) dark:text-(--text-inverse)`.

  | Token | Value | Dark twin | Use |
  |-------|-------|-----------|-----|
  | `--background` | `#ffffff` | `--background-inverse` `#000000` | Page background (set on `html` / `.dark`) |
  | `--surface` | `#ffffff` | `--surface-inverse` `#262626` | Cards, header, primary button (inverted) |
  | `--bg-subtle` | `#f4f4f4` | `--bg-subtle` with opacity (`/20`) | Hover fills, inputs |
  | `--bg-muted` | `#e6e6e6` | — | Stronger fills |
  | `--text-primary` | `#000000` | `--text-inverse` `#ffffff` | Main text |
  | `--text-secondary` | `#525252` | `--text-inverse-muted` `#a3a3a3` | Secondary text |
  | `--text-muted` | `#a3a3a3` | — | Placeholders, hover on links, "Coders" in the logo |
  | `--border-default` | `#e6e6e6` | `--border-inverse` `#3a3a3a` | Borders |
  | `--border-strong` | `#000000` | — | Emphasis borders |
  | `--sucess` | `#2590f6` | — | Success (name has a typo, keep it until renamed everywhere) |
  | `--destructive` | `#dc2626` | — | Destructive actions |

- The **primary button is inverted**: black on light, white on dark
  (`bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary)`).
- Recurring patterns (reuse them, don't invent new ones):
  - Rounded shapes: buttons and pills `rounded-full`, inputs and cards `rounded-2xl`.
  - Motion: `transition-all duration-300 ease-out`, `hover:-translate-y-0.5`,
    `active:scale-[0.98]`; icon nudge `group-hover:translate-x-1`.
  - Every `hover:` style also has an `active:` twin (touch devices).
  - Page section padding: `px-4 sm:px-6 md:px-12 xl:px-20`.
- Base typography in `main.css`: `html` 18px/28px, `h1` 56px, `h2` 40px; override
  with Tailwind sizes per breakpoint (`text-3xl sm:text-4xl`).
- Icons: `<span class="material-symbols-outlined">arrow_forward</span>`; shared
  components take the icon **name** in an `icon` prop.
- Mobile first. `useScreenSize()` gives `isMobile` (<768), `isTablet` (768–1023),
  `isDesktop` (≥1024) for logic; prefer Tailwind breakpoints for layout.
  The header switches to a drawer below `lg`.

## 10. PWA

`vite-plugin-pwa` with `strategies: 'injectManifest'`: it compiles
`service-worker/sw.ts` and injects the precache list (`js/css/html/ico/png/svg/woff2`,
up to 5 MB). `registerType: 'autoUpdate'`, enabled in dev (output in `dev-dist/`,
git-ignored). The SW calls `skipWaiting` + `clientsClaim`, cleans old caches and
handles FCM background messages. Manifest (`vite.config.ts`): name `ResenhaCoders`,
icons in `public/icons/hackathon-192.png` and `hackathon-512.png` (also maskable).

## 11. Known issues (fix before the demo)

| Issue | Where | Fix |
|-------|-------|-----|
| **Components still use the old palette** (`--primary`, `--surface-container*`, `--on-surface*`, `--outline`...). Those tokens no longer exist, so the styles are not applied | `shared/components/forms/*`, `buttons/categoryButton`, `iconButton`, `liveButton`, header drawer in `headerComp`, `auth/components/googleButton`, `module/views/NotFoundView`, `geolocation/views/HomeView` | Replace with the tokens in section 9 |
| **`npm run type-check` fails**: `@mapbox/mapbox-gl-geocoder` has no type declarations (TS7016), so `npm run build` fails too | `mapbox/components/mapboxComp.vue` | Add `declare module '@mapbox/mapbox-gl-geocoder'` in `env.d.ts` or install `@types/mapbox__mapbox-gl-geocoder` |
| `service-worker/sw.ts` imports `workbox-core`, which is not in `package.json` (works only as a transitive dependency) | `service-worker/sw.ts` | `npm install workbox-core` |
| HTTP client is empty | `src/app/plugins/axios.ts` | Bring `api` + `getErrorMessage` from `feat-login` |
| `notifications/services` uses `fetch` + manual CSRF instead of the shared client | `modules/notifications/services` | Move to `api` once it exists |
| `LoadingComp` has a nested `<template>` (renders nothing), is not exported in the barrel and points to a missing `/gifs/loading.gif` | `shared/components/general/loadingComp.vue` | Remove the inner `<template>`, export it, add the gif |
| `mapbox` imports the `geolocation` store (module → module) | `mapbox/components/mapboxComp.vue` | Move the store to `shared/` or pass coordinates as props |
| Mapbox geocoder is never removed on unmount (`isGeocoderAdded` is never set to `true`) | `mapboxComp.vue` | Set it after `addControl` or drop the flag |
| Geolocation errors are ignored (empty `switch`) | `geolocation/stores` | Expose an `error` ref and show it |
| `firebase.ts` calls `getAnalytics` on import; missing Firebase env vars throw | `src/firebase.ts`, `firebaseConfig.ts` | Fill `.env`; guard analytics with `isSupported()` |
| Favicon `/icons/logo.svg` is missing | `index.html`, `public/icons/` | Add the file or point to `hackathon-192.png` |
| No `.env.example` | repo root | Create it with the variables in section 6 |
| Token named `--sucess` (typo) | `main.css`, `baseButton.vue` | Rename to `--success` in both |
| Shared export is named `RangerSlider` (typo) | `shared/components/forms/index.ts` | Rename to `RangeSlider` and update callers |
| `label`/`required` from `IInputs` are not rendered by `BaseInput`/`PasswordInput` | `shared/components/forms/` | Render the label or drop the prop |
| Login, Register and Home (`HeroSection`) are empty | `modules/auth/views/`, `module/components/heroSection.vue` | Build the screens for the project |
| `src/modules/index.ts` is empty and unused | `src/modules/` | Remove or use as module registry |
=======
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
>>>>>>> 57b8c5a (docs: add project guide, conventions, team workflow, modules, agent rules and CI)
