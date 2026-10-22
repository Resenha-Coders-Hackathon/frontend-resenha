# ResenhaCoders Frontend

## Integrated Docker development

Use the workspace-level `docker-compose.yml` with both repositories side by side.
From the parent directory, run `docker compose up --build -d`. The frontend is at
http://localhost:5173 and the API at http://localhost:8000/api/v1/.
See the workspace `README.md` for environment variables, checks and persistent volumes.

## Production

The shared production infrastructure and main-branch deployment timer are versioned
in the backend repository under `deployment/`. Production serves the compiled build
at https://4000.michalski.app and uses its `/api/v1` proxy for authentication cookies.
The API is also exposed at https://3009.michalski.app/api/v1/.
After promotion to `main`, the server checks both repositories every two minutes
and builds the exact main commits. Pushes to `dev` do not update production.
