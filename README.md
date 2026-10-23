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

For cookie-based authentication, open the frontend at **http://localhost:5173** and send
requests to `/api/v1` on that same origin. Vite forwards `/api` to Django without changing
the path. When running Vite on the host, the default target is `http://127.0.0.1:8000`;
when running Vite in the provided Docker image, the target defaults to
`http://backend:8000` (override `API_PROXY_TARGET` on the frontend service if your
backend service has another name). Do not point the browser's API URL at port 8000 or
mix `localhost` and `127.0.0.1` in the browser.
Development ignores old absolute `VITE_API_BASE_URL` values, including those in a local
`.env` or workspace compose configuration.

The backend's development settings must also allow cookies on plain HTTP: use
`CSRF_COOKIE_SECURE = False`, `SESSION_COOKIE_SECURE = False` and
`CSRF_COOKIE_SAMESITE = SESSION_COOKIE_SAMESITE = 'Lax'` in Django's **dev settings only**.
If JWT cookies are configured separately, keep their development `Secure` flag off as
well. A frontend proxy cannot reliably make `Secure; SameSite=None` cookies work over
HTTP in every browser. Keep `Secure` cookies enabled in HTTPS production.

## Production

The shared production infrastructure and dev-branch deployment timer are versioned
in the backend repository under `deployment/`. Production serves the compiled build
at https://4000.michalski.app and uses its `/api/v1` proxy for authentication cookies.
The API is also exposed at https://3009.michalski.app/api/v1/.
The server checks the `dev` branch of both repositories every two minutes and
builds the exact dev commits. Updates to `main` do not update production.

Use `VITE_API_BASE_URL=/api/v1` (or leave it unset) for a same-origin production build;
the existing deployment currently sets an absolute URL on the same frontend origin,
which also works. If deploying elsewhere, configure the web server to forward `/api/`
to Django without rewriting the path. Do not use the cross-origin API hostname for
cookie authentication unless the backend cookie/CORS policy is explicitly designed for it.
