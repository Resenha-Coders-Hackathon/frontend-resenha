# Organization and invitation onboarding

## Design and routes

Creation follows Figma page **Frontend · App**, frames **F04** (`10:161`) and **F05**
(`10:231`), both 1440 × 1024. The previous member-management frame was the wrong
reference for this flow. See [Figma reference](FIGMA_REFERENCE.md).

- `/organizacoes`: organization list and entry to creation.
- `/organizacoes/nova`: organization name, workspace address, team size and optional logo.
- `/organizacoes/:organizationId/configurar-setores`: select/create sectors.
- `/organizacoes/:organizationId/convidar`: invite multiple e-mails, initial role and sectors;
  or skip invitations and open the organization.
- `/organizacoes/:organizationId/membros`: paginated members and invitation management.
- `/w/:slug`: authorized workspace address, resolving to the organization.
- `/invitations/accept?token=…`: existing public invitation entry point.

The desktop onboarding has a dark left brand panel and a centered 400 px form. The
prototype's 10 px form wrapper and 24 px decorative columns were corrected to natural
heights so forms/cards do not overflow. Mobile uses the supplied dark/orange direction
with scrolling content instead of a clipped fixed viewport. Original SVGs and Geist
font/license are local. Existing management screens remain separate.

## Backend contracts and migration

Organization responses include the read-only requester-scoped `current_role`.
New writable fields are `slug` (unique, lowercase words separated by hyphens, max 63)
and `team_size` (`1`, `2-10`, `11-50`, `51-200`, `201+`; blank for legacy clients).
Team size records the declared size and does not impose billing or seat limits.

`GET /organizations/by-slug/<slug>/` requires authentication and membership, returning
404 for inaccessible workspaces. Custom addresses use the current app origin plus
`/w/<slug>`; wildcard DNS/subdomain provisioning is not part of this change.

The optional logo uses the existing multipart `/uploads/` endpoint and saves its URL
in the existing `logo_url` field. The UI validates PNG/SVG up to 2 MB. Upload failures
prevent organization creation; a successful upload is reused if creation needs retry.

Invitation creation accepts optional `sector_ids` from the same active organization.
Existing clients without that field keep their old behavior. At explicit acceptance,
selected active sectors grant editor access to members or viewer access to readers,
inside the same transaction as membership and token consumption. Existing roles are
not overwritten. Deleted sectors are skipped; foreign sectors are rejected when inviting.
Owners can invite admins/members/viewers; admins can invite members/viewers.

Apply the migration before using the updated frontend:

```bash
python manage.py migrate
```

`0006_workspace_onboarding` assigns distinct addresses to existing organizations,
adds declared team size and the invitation/sector relation. It preserves existing IDs,
names, memberships, invitation tokens and their validity. It was tested on temporary
SQLite databases; it has not been run on production. Publish backend and frontend together.

## Authentication and feat/login integration

The old local `feat-login` was already an ancestor. The active remote branch was
`origin/feat/login` at `5c485a5`, initially merged as `d05ceeb`.
The feature branch was subsequently rebased onto `origin/dev` at `a10003e`;
that base already includes the login changes. The backend was rebased onto
`origin/dev` at `23fce16`. Local changes were reapplied and backup branches/stashes retained.
The integration retains both `useAuthSwap` animation and the validated internal return
target from `useAuthNavigation`. Updated aside images, decorative Kanban, chart and
Kanban modules, and API type exports from dev were retained. Decorative content is
not presented as verified backend data.

Login, registration, code verification and password reset preserve the invitation URL.
Passwords/codes remain only in the existing in-memory flow store. Authentication with
password or Google returns to explicit acceptance, never automatic membership. A
mismatched account cannot consume the invitation and can switch accounts while keeping
the return target. The guard uses `/users/me/`; network errors remain distinct from logout.

If navigation fails after creation or acceptance, the UI retains the successful result
rather than repeating organization creation or consuming the token again. Multi-email
sending records individual results and retries only failed recipients. Organization
creation and sector creation are separate committed steps; navigating away does not
roll back completed steps. Completed sector creations are kept if a later one fails.

## Verification

```bash
node --test src/modules/auth/__tests__/redirect.spec.ts src/modules/organizations/__tests__/onboarding.spec.ts
npm run lint
npm run build
python manage.py makemigrations --check --dry-run
python manage.py test core.modules.organizations.tests core.modules.invitations.tests core.tests.test_google_auth core.tests.test_email_templates core.modules.payments.tests --noinput
ruff check core/modules/organizations core/modules/invitations
```

Backend tests cover address/team-size validation and persistence, membership-scoped
address resolution, legacy creation, data migration, invitation sector validation,
editor/viewer access, deleted sectors and rollback of failed acceptance. Authentication
regressions cover registration, password login and new/existing Google accounts.
Node 24 runs the frontend utility tests without a new dependency; Vitest is not installed.

Post-rebase results: all 50 backend tests (including migration, email and payment tests) passed;
all four frontend utility tests, Ruff, lint, type-check and build passed. All ten
original onboarding SVGs were checked at their actual rendered dimensions and local
file locations in desktop/mobile, including Vite-inlined assets. No unresolved Git
conflicts or temporary Figma asset URLs remain in application source.

Browser checks use an isolated API/database and in-memory mail: three-step creation,
logo payload, selected sectors, partial-send retry, custom address resolution, auth
continuation through password recovery and animated login/signup, token refresh,
wrong-account rejection and acceptance. F04/F05 geometry is checked at 1440 px
(600 px panel, 400 px form) and screenshots at 390/320 px. The font is local.
Google Identity/token verification and Cloudinary are simulated; real provider
interaction and actual e-mail delivery remain unverified.

The dev lockfile was repaired for missing bundled transitive entries, without changing
declared dependencies; `npm ci` now succeeds. Payment tests clear their shared throttle
cache before login and assert authentication, preventing test-order failures.

The dev backend image lacks `django_extensions`; only the temporary test process
omits that optional app. Repository settings and dependencies were not changed for it.
Build retains existing large-chunk/PWA warnings. No production deployment or push occurred.
