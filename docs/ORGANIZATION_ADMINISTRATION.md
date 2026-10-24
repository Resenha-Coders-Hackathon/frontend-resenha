# Organization administration

This increment exposes existing backend capabilities without replacing organization creation, onboarding, invitation acceptance or the board UI.

## Available screens

- `/organizacoes/:organizationId/membros`: existing members/invitations screen, now with authorized role changes, removal and self-departure. Owners cannot leave or be demoted through these controls.
- `/organizacoes/:organizationId/times`: create and edit teams, manage membership and lead/member roles, self-departure and confirmed permanent deletion. Organization admins create/delete teams; admins and team leads manage a team's members and identity.
- `/organizacoes/:organizationId/setores`: create/edit sectors, choose privacy, manage direct members and team links, update grant roles and confirm sector deactivation. Creation remains available to organization members; management follows the backend's effective `my_role`.
- `/organizacoes/:organizationId/configuracoes`: edit name, slug, description, team size and logo; owner-only deactivation of a shared organization. Personal organization deletion remains protected.

All screens reuse the organization shell, current application theme and typed axios services. Navigation is available from any organization page. Selectors and directories collect all API pages using the existing shared helper; search filters the loaded directory. This is not server-side search or virtualized large-directory rendering.

## Access behavior

The server remains authoritative. Organization owner/admin, direct sector membership and linked teams contribute to the highest effective sector role. Organization-public sectors grant at least viewer access to organization members, not public internet access. A team lead does not automatically manage its linked sectors.

Changing a team grant uses the new `PATCH /api/v1/sectors/:sectorId/teams/:linkId/` with `{ "role": "manager" | "editor" | "viewer" }`. It validates manager authority, role and sector/link ownership without deleting and recreating the link.

Removing an organization member clears their team and direct sector memberships only in that organization, transactionally. Rejoining does not restore those stale grants. Historical tasks and authorship are not removed.

Organization settings now validate against the existing instance so retaining the current slug succeeds while using another organization's slug fails.

## Design and verification

The inspected Figma reference is [Equipe e setores](https://www.figma.com/design/ylOa2V5UJmvnx85NWv3rUf/Inceptum?node-id=4-2). New management forms are adaptations using the current application shell, cards, tabs, theme tokens and BaseButton, not a pixel-identical replacement of the prototype.

Validation commands:

```sh
docker compose exec -T frontend npm run build
docker compose exec -T frontend node --experimental-strip-types --test src/modules/organizations/__tests__/onboarding.spec.ts src/modules/organizations/__tests__/permissions.spec.ts
docker compose exec -T frontend npx oxlint src/modules/organizations src/modules/teams src/modules/module/services/index.ts src/modules/module/index.ts
docker compose exec -T frontend npx eslint src/modules/organizations src/modules/teams src/modules/module/services/index.ts src/modules/module/index.ts
docker compose exec -T backend python manage.py test core.modules.organizations.tests core.modules.teams.tests core.modules.kanban.tests.test_sector core.modules.invitations.tests --noinput
```

Browser checks use simulated API responses; backend permission/integrity tests exercise the real application services in the test database. Neither alone establishes an authenticated end-to-end production verification.

Verified for this increment: 55 backend tests, four Node tests, scoped Oxlint/ESLint and Ruff checks, and the frontend build/type check passed. Chromium exercised creation of teams/sectors, adding participants, linking a team, changing its grant, saving organization settings and changing a member role. Desktop/mobile captures were inspected, mobile document overflow was checked, and viewer-only controls and a dark-theme capture were verified. Build still emits large-chunk and PWA option-deprecation warnings.

## Remaining scope from the broader proposal

Ownership transfer, archive restoration, administrative activity UI, invitation resend, invitation-to-team assignment, a complete per-person effective-access inspector and aggregate overview remain unimplemented. Team deletion retains its existing permanent behavior; sector and organization deactivation retain their existing soft-delete behavior. Confirmations describe these differences. No migration or new dependency is introduced by this increment.

Board/status management is left to the existing Kanban work. No deployment, commits or changes to environment secrets are included.
