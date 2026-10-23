# ResenhaCoders Frontend

## Figma interface development

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
