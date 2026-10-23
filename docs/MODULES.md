# Modules inside `src/`

Boundaries of responsibility, not separate apps. The modular structure below is the **pattern every module follows**; the modules listed are the current ones, not a limit. New domains are added as new modules with the same layout. Structure and rules:
[`PROJECT_GUIDE.md`](PROJECT_GUIDE.md); naming: [`CONVENTIONS.md`](CONVENTIONS.md).

```text
src/
├── app/                  # global wiring
│   ├── router/           # merges every module's routes
│   ├── layouts/          # DefaultLayout
│   ├── plugins/          # axios
│   └── composables/      # useTheme
├── modules/
│   ├── auth/             # login, register, Google button
│   ├── module/           # home, 404 (generic name, see PROJECT_GUIDE known issues)
│   └── geolocation/ mapbox/ notifications/ payments/   # in feature branches, same pattern
├── shared/               # domain-free components, types, utils
└── main.ts
```

## Dependency rules
- `auth` code lives in `src/modules/auth/`, and so on for every domain.
- A module never imports another module's internals; use public barrels (`index.ts`).
- `shared` must not depend on `modules`; if it does, the code is not really shared.
- Global wiring (router, guards, plugins, global stores, axios) needs an owner and coordination.
- Types used across domains and API contracts have one identifiable source of truth: the backend serializers.
- Cross-module changes are allowed when the Issue lists the domains and interfaces involved.

## Inventory

| Path | Owner | Responsibility | Public interface / dependencies | Active Issues |
|------|-------|----------------|---------------------------------|---------------|
| `src/modules/auth/` | TBD | Login and registration screens; Google sign-in button | `authRoutes`; components barrel; uses `@/shared/components` and `DefaultLayout` | — |
| `src/modules/module/` | TBD | Home page, hero section, 404 | `moduleRoutes`; components barrel | — |
| `src/shared/` | TBD | Buttons, form controls, header, theme switcher; `IInputs`, `IMenuItems` | `@/shared/components`, `@/shared/types` | — |
| `src/app/` | TBD | Router, layouts, axios plugin, `useTheme` | `router/index.ts` | — |
| `src/modules/geolocation/ | TBD | Browser geolocation store and screen | `geolocationRoutes` (`feat-geolocation`) | — |
| `src/modules/mapbox/` | TBD | Mapbox map component | `mapboxRoutes` (`feat-mapbox`) | — |
| `src/modules/notifications/` | TBD | Inbox, unread/read actions, realtime and browser FCM lifecycle ([integration](NOTIFICATIONS.md)) | `notificationsRoutes` | `useNotificationsStore`, `useNotificationSession`, `NotificationLink` |
| `src/modules/payments/` | TBD | Payment form, Pix and result screens | `paymentsRoutes` (`feat/payments`) | — |
| `src/modules/ai/` | TBD | Ask the backend AI (`POST /ai/ask/`); service and store only | `useAiStore`, `askAi` | — |

Rows for modules from feature branches stay until that branch is merged or dropped.
When a new module is created, add its row and follow the same structure.
