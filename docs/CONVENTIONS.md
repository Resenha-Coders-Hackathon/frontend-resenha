# Code Conventions

See [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md) for structure, stack and rules.

Code, comments, commits, branch names and docs are written in **English**.
User-facing UI copy is in **Portuguese (pt-BR)**.

## Branches

| Prefix | Use |
|--------|-----|
| `feat/<kebab-name>` | New feature (`feat/google-auth`) |
| `fix/<kebab-name>` | Bug fix (`fix/login-redirect`) |
| `docs/<kebab-name>` | Docs only |
| `chore/<kebab-name>` | Tooling, deps, CI |

| Branch | Role |
|--------|------|
| `main` | Stable / release. Only receives merges from `dev` |
| `dev` | Integration base. Every branch starts here and returns via PR |

Never commit directly to `main` or `dev`. Open a PR into `dev`, referencing the Issue
(`Refs #12`). Process details: [`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md).

## Commits

[Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <imperative summary>`

```
feat(auth): add RegisterView and route
fix(shared): keep BaseInput focus ring in dark mode
```

## Project layout

A single Vue app; every domain is a folder in `src/modules/`. Inside a module, split by
layer, one file per subject:

```
src/modules/<module>/
  views/<Name>View.vue        # route targets
  components/<name>.vue       # module-only UI
  composables/use<Name>.ts
  services/<subject>.ts       # HTTP only
  stores/<subject>.ts         # Pinia
  types/<subject>.ts
  utils/<subject>.ts
  router/index.ts             # exports <module>Routes
  index.ts                    # public barrel per folder
```

- Every new module follows this same modular pattern (same layers, `index.ts` barrels, `<module>Routes`). The pattern is the standard to follow, not a cap on which modules or layers a project may have.
- Views never call axios; they use a store/service. Services return typed data and know nothing about the UI.
- HTTP goes through the shared `api` instance (`@/app/plugins/axios`) only: **no `fetch`**, no manual CSRF/cookie handling, no hard-coded base URLs. Type payloads and responses (`api.post<T>`).
- A module must not import another module's internals. Shared code goes to `src/shared/`
  (which must not import from `modules/`).
- Global wiring (router, plugins, layouts) lives in `src/app/` and needs coordination.
- Import with the `@` alias; use barrels (`@/shared/components`) instead of deep paths.
- No `any` and no unsafe casts without a justification comment.
- Secrets never go in the frontend; env vars use the `VITE_` prefix and are documented in `.env.example`.

## Naming

| Thing | Style | Example |
|-------|-------|---------|
| Page component | `PascalCase` + `View` suffix | `LoginView.vue` |
| Layout | `PascalCase` + `Layout` suffix | `DefaultLayout.vue` |
| Other component file | `camelCase.vue` (current repo style) | `baseButton.vue`, `googleButton.vue` |
| Component name in templates/imports | `PascalCase` | `<BaseButton />` |
| Composable | `use<Name>`, file `use<Name>.ts` | `useTheme.ts` |
| Pinia store | `use<Subject>Store` | `useAuthStore` |
| Service | `<subject>.ts`, functions named as verbs | `login()`, `fetchSessions()` |
| Interface / type | `I<Name>` for props/interfaces, `PascalCase` for types | `IInputs`, `IMenuItems` |
| Variable / function | `camelCase` | `isDark`, `toggleTheme` |
| Constant | `UPPER_SNAKE_CASE` | `CODE_LIFETIME` |
| Route path | `kebab-case` (pt-BR slug as today) | `/entrar`, `/registrar` |
| Route name | `PascalCase` | `Login`, `Register` |
| Routes export | `<module>Routes` | `authRoutes` |
| Barrel | `index.ts` per folder | `shared/components/buttons/index.ts` |
| Env var | `VITE_<SERVICE>_<NAME>` | `VITE_MAPBOX_TOKEN` |
| Test file | `<subject>.spec.ts` in the module's `__tests__/` | `auth/__tests__/login.spec.ts` |
| Test case | `it('<behavior>')` | `it('shows the backend error on a wrong password')` |

## Components

- `<script setup lang="ts">` first, then `<template>`, then `<style>` only if Tailwind can't do it.
- Type props with an interface (`defineProps<IInputs>()`), events with `defineEmits<{...}>()`.
- Form controls support `v-model` (`modelValue` / `update:modelValue`).
- Style with Tailwind utilities and the theme tokens in `src/assets/main.css`; every colored
  element needs its `dark:` counterpart. No inline hard-coded colors.
- Responsive by default (mobile first: `sm:`, `md:`, `lg:`).
- Accessibility: labels on inputs, `aria-*` on icon-only buttons, keyboard-reachable controls.
- Add a short "COMO USAR"/usage comment on new `shared` components, as `BaseInput` does.

## API

- Every service function declares its return type (`Promise<User>`, `Promise<void>`); request payloads have an interface.
- Keep backend payload keys in `snake_case` in the API types; convert only at a deliberate boundary.
- Backend messages come as `{ detail }` (or per-field errors); extract them with `getErrorMessage` and show with `vue3-toastify`.
- Routes require authentication by default. Public routes must explicitly declare
  `meta: { requiresAuth: false }`; account entry routes also set `guestOnly: true`.
- Keep `types/` in sync with the backend serializers; the backend is the source of truth.

## Tooling

- `npm run type-check`, `npm run lint` and `npm run format` must pass before opening a PR.
- Prettier: no semicolons, single quotes, print width 100 (`.prettierrc.json`).
- Add dependencies with `npm install <pkg>` so `package-lock.json` stays in sync; justify new ones in the PR.
- Tests use Vitest + `@vue/test-utils` (see [Testing](PROJECT_GUIDE.md#testing)): non-trivial logic needs a test, services mock `api`, no real network.
- Only report tests you actually ran. Until the runner is installed (`npm run test` does not exist yet), say so in the PR.
