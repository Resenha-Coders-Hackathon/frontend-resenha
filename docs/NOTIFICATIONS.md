# Notifications

The `/notificacoes` route now displays the authenticated user's persisted inbox with
unread count, unread filter, pagination, read actions, browser push controls and a
test sender. Navigation links show the unread count in the default/workspace layouts.

`App.vue` starts `useNotificationSession` using the authenticated user ID. It connects
to the existing cookie-authenticated `/ws/`, handles `notification.created`, reconnects
on connection loss and resets memory when the account changes. Browser push is restored
only after a previous explicit activation and an already-granted browser permission.
Logout, revoking all sessions and account deactivation unregister the remembered device
before the server clears its cookies or invalidates the session.

The browser toggle registers/unregisters a device. It does not change the backend's
global `push_enabled` preference. That preference still needs a public settings API.

Firebase is optional for the inbox and WebSocket features. Configure the public Firebase
variables and `VITE_VAPID_KEY` in `.env.local` or the production build arguments to use push.
Never copy the private service-account JSON into frontend configuration.

The development PWA worker remains disabled. Use a production build/preview or the
HTTPS deployment for actual push. The backend `FRONTEND_URL` controls the HTTPS click
link; callbacks with a `notification` payload are displayed automatically by Firebase
in the background. The frontend must not display a second notification manually.

Checks:

```sh
node --test src/modules/notifications/__tests__/notifications.spec.ts
npm run type-check
npm run lint
npm run build
```

The focused Node 24 tests run real Vue/Pinia with mocked HTTP/Firebase boundaries.
The backend assessment, complete API contract, infrastructure findings and proposed
next steps are in `backend-resenha/docs/NOTIFICATIONS_INTEGRATION.md` in the server workspace.
Tests and release status are recorded in the integration PRs. Live browser/FCM delivery
remains an acceptance step after deployment.
