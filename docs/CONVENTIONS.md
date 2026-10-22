# Code Conventions

See [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md) for architecture, folders and backend
integration, and [`COMPONENTS.md`](COMPONENTS.md) for the shared UI kit.

Code, identifiers, commits, branch names and docs are written in **English**.
Everything the **user sees** (labels, messages, toasts, error messages thrown by
services, page text) and URL paths are in **pt-BR**. Comments follow the language
of the file they are in.

## Branches

Same rules as the backend.

| Prefix | Use |
|--------|-----|
| `feat/<kebab-name>` | New feature (`feat/freight-quote`) |
| `fix/<kebab-name>` | Bug fix (`fix/header-drawer-tokens`) |
| `docs/<kebab-name>` | Docs only |
| `chore/<kebab-name>` | Tooling, deps, CI |

| Branch | Role |
|--------|------|
| `main` | Stable / release. Only receives merges from `dev` |
| `dev` | Integration base. Every `feat/*` starts here and returns via PR |

Use `/` after the prefix (older branches like `feat-login` use `-`; don't copy that).
Never commit directly to `main` or `dev`. Open a PR into `dev`, referencing the
Issue (`Refs #12`). Process details: [`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md).

## Commits

[Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <imperative summary>`.
Scope is the module or layer.

```
feat(mapbox): add route drawing with mapbox-gl-draw
fix(shared): move form inputs to the neutral tokens
docs: add frontend project guide
```

## Naming

| Thing | Style | Example |
|-------|-------|---------|
| Module folder | `camelCase`, domain noun | `auth`, `geolocation`, `notifications` |
| View file | `PascalCase` + `View` | `LoginView.vue`, `HomeView.vue` (module landing page) |
| Layout file | `PascalCase` + `Layout` | `DefaultLayout.vue` |
| Component file | `camelCase` | `baseButton.vue`, `mapboxComp.vue` |
| Component export / tag | `PascalCase` (from the barrel) | `BaseButton`, `<MapboxComp />` |
| Generic shared component | `Base<Thing>` for the default version | `BaseInput`, `BaseSwitch` |
| Feature component | `<Thing>Comp` when the name alone is a domain word | `MapboxComp`, `NotificationComp` |
| Composable | `use<Thing>` | `useTheme`, `useLoading`, `useScreenSize` |
| Store | `use<Module>Store`, id = module name | `useGeolocationStore` / `defineStore('geolocation', ...)` |
| Service function | verb + noun, async | `sendNotification`, `fetchShipments` |
| Shared interface | `I` + `PascalCase` | `IInputs`, `IMenuItems` |
| Component props type | local `interface Props` | `interface Props { label: string }` |
| Request/response type | `<Action><Subject>Request` / `Response` | `SendNotificationRequest` |
| Route export | `<module>Routes` | `mapboxRoutes`, `notificationsRoutes` |
| Route name | `PascalCase` English | `Login`, `Notifications` |
| URL path | pt-BR, `kebab-case` | `/entrar`, `/localizacao`, `/notificacoes` |
| Event | `kebab-case` / `update:<prop>` | `update:modelValue` |
| Env var | `VITE_` + `UPPER_SNAKE_CASE` | `VITE_API_BASE_URL`, `VITE_MAPBOX_API_KEY` |
| CSS token | `--kebab-case`, dark twin with `-inverse` | `--surface` / `--surface-inverse` |
| API fields in types | `snake_case`, same as the backend | `created_at`, `is_active` |

## Components

- Always `<script setup lang="ts">`, then `<template>`, then optional `<style scoped>`.
  No Options API, no `defineComponent`.
- Props: `withDefaults(defineProps<Props>(), {...})` with a default for every optional prop.
- Events: typed `defineEmits<{ 'update:modelValue': [value: string] }>()`.
- **v-model** follows the existing pattern: `modelValue` prop + `update:modelValue`
  emit, bridged with a `computed({ get, set })`:

  ```ts
  const value = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
  })
  ```

- Shared components start with a `/* COMO USAR: ... */` block showing the minimal
  usage (state + tag). Add one to every new shared component.
- Shared components are dumb: no store, no HTTP, no router pushes. Data comes in
  props, actions go out as events.
- Every folder of components has an `index.ts` barrel; register new components there
  and import from the barrel, never from the `.vue` file:

  ```ts
  import { BaseInput, BaseButton } from '@/shared/components'
  import { MapboxComp } from '../components'
  ```

- Static lists used by the template (menu items, options) are typed constants in `<script setup>`.
- Browser/SDK resources (maps, watchers, listeners) are created in `onMounted` and
  released in `onBeforeUnmount`/`onUnmounted` (see `mapboxComp.vue`, `notificationComp.vue`).
- Async actions in components: `isX` ref → `try/catch/finally` → `toast` from `vue-sonner`
  (see `notificationComp.vue`).

## Imports

- Across layers use the alias: `@/shared/...`, `@/app/...`, `@/firebase`.
- Inside the same module use relative paths: `../components`, `../services`.
- Type-only imports use `import type { ... }` (or inline `type` in a value import).
- A module never imports another module. If two modules need it, move it to `shared/`.

## Styling

- Tailwind utilities in the template. `<style scoped>` only for what Tailwind
  can't express (`<Transition>` classes, `-webkit-autofill`).
- Colors only through the tokens in `src/assets/main.css`: `bg-(--surface)`.
  Check the token exists before using it. No raw hex in templates.
- Every color class has a `dark:` pair (usually the `-inverse` token); every
  `hover:` has an `active:` pair.
- New tokens go in the `@theme` block of `main.css`. Agree on it first: it is shared.
- Long class lists on conditional variants go in a `computed` array grouped by
  `// BASE`, `// SIZE`, `// VARIANTS` comments (see `baseButton.vue`).

## TypeScript

- No `any`. Type every ref (`ref<number | null>(null)`) and API response.
- `noUncheckedIndexedAccess` is on: array/record lookups may be `undefined`; handle it.
- Entity and payload types live in the module's `types/`; only cross-module types
  go to `shared/types` (exported from its `index.ts`).
- Services throw `Error` with a user-ready pt-BR message; views show `error.message`.

## Tooling

- Prettier: no semicolons, single quotes, `printWidth: 100`, 2 spaces, LF.
- `npm run lint` (oxlint + ESLint, auto-fix) and `npm run type-check` must pass
  before opening a PR; run `npm run format` too.
- Add dependencies with `npm install <pkg>` so `package-lock.json` stays in sync;
  new dependencies need the owner's approval.
- Keys come from `.env` (`import.meta.env.VITE_*`), never hard-coded. Document new
  ones in `docs/PROJECT_GUIDE.md` (section 6). Anything `VITE_*` ends up in the
  bundle: never put a private secret there.
