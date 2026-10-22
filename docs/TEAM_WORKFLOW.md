# Team Workflow

How we split work and integrate it. Naming, commits and code style live in
[`CONVENTIONS.md`](CONVENTIONS.md); architecture and backend integration in
[`PROJECT_GUIDE.md`](PROJECT_GUIDE.md).

## Source of truth

- **Issues** describe the work: owner, scope, dependencies and acceptance criteria.
- **GitHub Projects** (optional) shows status and priority.
- **Pull requests** document review and integration.

The Project board does **not** lock files: it never prevents two people from
editing the same module. Always check open Issues and PRs yourself.

Suggested states: Backlog → Ready → In progress → In review → Done
(plus Blocked when needed).

## Before you start a task

1. Read the Issue: scope, owner, dependencies, acceptance criteria.
2. Check open Issues and PRs for overlap in modules, shared components or API contracts.
3. Confirm who owns it. Write the branch name and dependencies in the Issue.
4. Branch from `dev` (see [Branches](#branches-and-pull-requests)).

Shared contracts need agreement **before** the change is made:

- **API**: endpoint, payload and response shape, agreed with whoever owns the
  backend side. The frontend never invents an endpoint.
- **Shared frontend files**: `src/app/*`, `src/shared/*`, tokens in
  `src/assets/main.css`, `src/firebase*.ts`, `service-worker/`, `vite.config.ts`,
  `package.json`.

## Branches and pull requests

- One Issue = one branch = one PR.
- Branch from `dev`, named `<prefix>/<kebab-name>` (`feat/`, `fix/`, `docs/`, `chore/`).
- Open the PR into `dev`. Never commit directly to `main` or `dev`.
- The PR references the Issue (`Refs #12`), lists the modules touched, shared
  files affected, API endpoints and env vars used, checks run (with real results)
  and what was **not** verified.
- Run `npm run type-check`, `npm run lint` and `npm run build` locally first.
  Attach a screenshot (light and dark, mobile and desktop) for UI changes.
- Don't force-push a branch someone else is working on.

## Splitting a large Issue (optional)

For work that spans several modules or people (or AI agents):

1. One owner splits the main Issue into linked sub-Issues, each with scope,
   contracts, acceptance criteria and dependencies. One module per sub-Issue
   works best.
2. Define shared interfaces first: types, store shape, service signatures,
   route names, merge order.
3. Each person or agent works on its own branch and opens its own PR. Agents on
   the same machine need separate git worktrees or clones, never the same directory.
4. A designated integrator merges the PRs into an integration branch and runs
   type-check, lint and build.
5. The final PR references the main Issue and all sub-Issues. Don't close
   anything before the combined verification passes.

## Collisions

If you find two changes overlapping:

1. Stop editing the conflicting files.
2. Record it in the Issue or PR.
3. Agree on who owns the interface, how files are split, or the order of work.
4. Re-plan, then resume.

Merge conflicts are not the only risk: check for semantic conflicts too (two
modules registering the same path, a renamed shared prop or token, a changed API
response). These files conflict in small append-only ways; keep both sides:

- `src/app/router/index.ts` (imports and route spreads)
- `src/shared/components/*/index.ts` and `src/shared/types/index.ts` (barrel exports)
- `src/main.ts` (global CSS imports)
- `package-lock.json`: keep either side, then run `npm install`

## Tooling access

Whether an assistant can read or update Projects, Issues and PRs depends on the
tools and permissions enabled. Check access before promising updates; without it,
report manually. Use least-privilege tokens and never commit them.
