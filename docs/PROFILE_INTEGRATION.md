# Profile and settings integration

## Delivered API contracts

The frontend and backend changes must be released together. All exposed user/profile
fields already existed; the preferences added in this follow-up require migration `0007`.

- `GET /api/v1/users/me/`: `id`, `name`, `email`, `bio`, `avatar_url`, `created_at`.
- `PATCH /api/v1/users/me/update/`: `name`, `bio`, `avatar_url` only. The response is
  the writable subset, merged into the authenticated user store (not a full user).
- `GET/PATCH /api/v1/users/me/settings/`: `theme` (`light`, `dark`, `system`),
  `locale`, `timezone`, `push_enabled`, `email_product`, `email_weekly_digest`,
  `email_security`. Settings are created lazily for the authenticated user.
- `GET /api/v1/sessions/` also exposes `location` and `last_activity`; session identifiers
  remain numeric, and token JTIs are never exposed.
- E-mail change uses the existing authenticated `request → verify → confirm` endpoints
  with a six-digit code delivered to the new address and the current password at confirm.
  Codes/passwords stay in component memory. Reloading abandons the local flow.
- Password change reuses the existing recovery request, code verification and new-password
  screens. On success the auth store is cleared and the user signs in again.

Profile and preferences are separate API writes, not an atomic transaction. If the
profile write succeeds but the preferences write fails, the saved profile baseline is
retained and the UI reports the error. Cancel restores the last successful values for
the active tab. Unsaved theme previews are restored when leaving settings.

The `locale` and `timezone` fields are persisted preferences; this change does not add
application-wide translation or date conversion. Notification preferences are persisted;
it does not add a weekly e-mail scheduler or product/security e-mail delivery jobs.
`push_enabled` is already checked by the backend notification service; browser permission
and FCM registration remain separate from this server preference.

## Added settings model fields

Migration `0007_usersettings_app_ai_usersettings_app_comments_and_more` adds the fields
needed by the existing frontend controls: `email_assigned`, `email_mentions`,
`email_deadlines`, `app_comments`, `app_status`, `app_ai`, `date_format`, `week_start`,
`compact_cards` and `show_completed`. Existing rows receive explicit defaults, and the
fields are exposed through the user-settings GET/PATCH serializer.

`job_title` is intentionally excluded as requested. It does not exist in `User`; if
needed later, decide whether it belongs to the user or an organization membership rather
than treating organization role as a job title.

These controls persist their preferences. Product/security/weekly and per-event email
delivery jobs do not exist yet; likewise the notification backend does not currently
classify and suppress all comment/status/AI in-app events by these flags. Implementing
those delivery behaviors requires separate backend event/scheduler work and is not
implied by saving the settings. `push_enabled` already gates FCM delivery.

Two-factor authentication has no backend protocol/model in this integration. Do not add
an `enabled` Boolean and call it secure 2FA: enrollment, verified devices, encrypted TOTP
secrets, hashed recovery codes and a login challenge require a separate security design.

## Backend fields intentionally not editable

- `created_at` is metadata, not a form input. `updated_at` is not exposed by the current API.
- User/session IDs, activity timestamps, session IP/location are server-managed.
- `is_active` uses the dedicated deactivation operation, not profile PATCH.
- `is_staff`, `is_superuser`, password hashes and token JTIs must never be profile inputs.
- Photo selection, camera capture and cropping are local only. The camera dialog uses
  `getUserMedia` with audio disabled, a live preview, capture and a front/back camera
  preference. It stops all tracks on close, switching, capture and unmount, including
  streams arriving after the user has already closed the dialog. Live camera access
  requires HTTPS/localhost, browser support, device availability and permission.
  A native `capture` file input and the normal photo picker provide fallback paths;
  the browser/OS ultimately decides whether native capture is offered.
- The crop dialog uses a circular avatar guide with dimmed corners, drag/keyboard
  positioning, pinch/wheel/button zoom and reset (no slider). Its image stage resizes to
  the available modal space rather than creating an internal scroll area. The saved
  file remains a square 512 × 512 PNG; circular presentation is a frontend mask.
  No upload request is made until **Save changes** is clicked on the Profile tab.
  Save first validates the profile, uploads the cropped file through authenticated
  `POST /uploads/`, and sends its returned URL in the profile PATCH.
  The frontend accepts JPG/PNG/WebP source images up to 10 MB. Failed uploads preserve
  the draft and stop the profile write; a failed PATCH reuses a successful upload on retry.
  Cancel before saving discards the local photo without creating a Cloudinary asset.
  Cancel after a successful upload but failed PATCH does not delete the unlinked asset
  (there is no public delete endpoint in this integration). Blob URLs are revoked on
  replacement, cancel and unmount, and uploads are aborted when leaving the page.

The backend process needs `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
with real credentials, then a restart. `Must supply api_key` means the SDK lacks that
configuration. Never put these credentials in `VITE_*` variables or commit them.

- Session location can be blank: displaying it does not add geolocation enrichment.

## Verification

Frontend utility tests use Node's existing test runner. Backend tests cover lazy creation,
account isolation, GET/PATCH round trips, validation, cookie/CSRF enforcement, safe profile
serialization, session metadata and the existing e-mail/password code flows with mail mocked.
Real e-mail delivery and end-to-end browser/provider behavior require separate verification.

Checks run for this implementation:

- Frontend: 8 Node utility tests, `npm run type-check`, `npm run build` and scoped ESLint
  passed. `npm run lint` fails on 7 pre-existing errors in generated `dev-dist/workbox-*.js`.
- Backend: 13 tests passed (`core.modules.user_settings.tests`,
  `core.tests.test_token_refresh`, `core.tests.test_google_auth`); `manage.py check`, scoped
  Ruff and `makemigrations --check --dry-run` passed (no model changes detected).
- No production deployment, migration application to production or real e-mail delivery was performed.
