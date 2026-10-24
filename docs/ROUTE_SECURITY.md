# Frontend route protection

All routes require a server-validated session by default. Adding a page without
metadata keeps it private. `installAuthGuard` runs before route components resolve,
using the [Vue Router navigation-guard behavior](https://router.vuejs.org/guide/advanced/navigation-guards).

| Routes | Access |
| --- | --- |
| `/entrar`, `/registrar`, `/registrar/codigo` | Public account entry; authenticated users return to a safe destination or home |
| `/esqueci-senha`, `/esqueci-senha/codigo`, `/esqueci-senha/nova-senha` | Public password recovery; existing views check the in-memory flow prerequisites |
| `/invitations/accept?token=...` | Public invitation landing; accepting requires authentication and backend authorization |
| All other pages, including unknown paths | Private; verified through `GET /users/me/` before navigation |

The route registry is in `src/app/router/routes.ts`. Explicit public exceptions use
`meta.requiresAuth = false`; account entry pages also use `meta.guestOnly = true`.
The `/auth` layout URL redirects to the named login route.

The guard never trusts a cached profile as proof of a current session. Anonymous
visitors go to `/entrar?redirect=...`, retaining query parameters and fragments.
After login, `safeRedirect` rejects external/malformed destinations. The guest guard
also rejects return destinations that point back into account entry pages, avoiding loops.

Axios retains the existing one-refresh-at-a-time behavior. A failed refresh with
401/403, or a second 401 after refresh, clears the cached account and session list.
Private pages redirect with history replacement; public pages remain accessible.
The `/users/me/` session probe lets the guard handle redirects, avoiding recursion.
Network errors propagate and cancel private navigation without treating an outage
as a confirmed logout. A normal 403 from a business API does not clear authentication.

Login initializes CSRF through `/csrf/` on a best-effort basis (the login POST itself
needs no CSRF and its response sets the cookie, so a failed call never blocks sign-in),
and axios reads the rotated cookie for subsequent writes and refresh. JWTs remain in HttpOnly cookies. Frontend guards
control navigation; backend authentication and authorization continue to enforce
access to data and actions.

Focused regression tests use Node's installed test runner, the real Vue Router
with memory history and the real Axios instance with a fake adapter. Vue view
imports and HTTP responses are mocked; no new dependency is introduced.

```sh
node --test src/modules/auth/__tests__/*.spec.ts src/modules/notifications/__tests__/*.spec.ts src/modules/organizations/__tests__/*.spec.ts
npm run type-check
npm run lint
npm run build
```

Browser interaction and production deployment require separate acceptance; no
production changes or live provider requests are part of this local validation.

Local verification passed: all 37 frontend tests (18 new guard/session cases),
TypeScript checking, lint and the production/PWA build. The final route-coverage
run also checks unnamed layout URLs. Changes remain local on
`fix/frontend-route-security`; browser acceptance and deployment were not performed.
