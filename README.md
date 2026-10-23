# ResenhaCoders Frontend

## Figma interface development

Organization creation, member lists and invitation onboarding are available at
`/organizacoes`. See [organization onboarding](docs/ORGANIZATION_ONBOARDING.md) for
authentication continuation, API requirements and verification.

See the [design reference](docs/FIGMA_REFERENCE.md) for the source Figma file, access
status and implementation workflow, and the [figma-interface agent](.claude/agents/figma-interface.md)
for specialized interface implementation instructions.

## Integrated Docker development

Use the workspace-level `docker-compose.yml` with both repositories side by side.
From the parent directory, run `docker compose up --build -d`. The frontend is at
http://localhost:5173 and the API at http://localhost:8000/api/v1/.
See the workspace `README.md` for environment variables, checks and persistent volumes.

## Production

The shared production infrastructure and dev-branch deployment timer are versioned
in the backend repository under `deployment/`. Production serves the compiled build
at https://4000.michalski.app and uses its `/api/v1` proxy for authentication cookies.
The API is also exposed at https://3009.michalski.app/api/v1/.
The server checks the `dev` branch of both repositories every two minutes and
builds the exact dev commits. Updates to `main` do not update production.

## Dependency maintenance

Use `npm ci` to install the lockfile and `npm audit` to check advisories.
Firestore currently pins an older gRPC line; the scoped override selects the
patched `~1.13.6` line without downgrading Firebase. Remove it once Firestore
requires a corrected version itself. See the [upstream advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j).

The optional `@firebase/util` and `protobufjs` install scripts are explicitly denied.
Firebase configuration comes from the existing application configuration, so Firebase
App Hosting postinstall discovery is unnecessary here. The protobuf script only
checks the dependent package's version convention.

Workbox still depends on the deprecated `glob` 11 line. Keep its replacement tied to
an upstream Workbox update rather than forcing a different major into the build.
