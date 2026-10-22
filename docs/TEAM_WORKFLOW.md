# Team Workflow

How we split work and integrate it. Naming, commits and code style live in
[`CONVENTIONS.md`](CONVENTIONS.md); structure and rules in
[`PROJECT_GUIDE.md`](PROJECT_GUIDE.md); the module inventory in [`MODULES.md`](MODULES.md).

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
2. Check open Issues and PRs for overlap in files, modules or shared contracts.
3. Confirm who owns it. Write the branch name and dependencies in the Issue.
4. Branch from `dev` (see [Branches](#branches-and-pull-requests)).

Shared contracts (backend API shapes and the matching `types/`, routes and guards, Pinia
stores, the axios plugin, `src/shared/`, `vite.config.ts`, the Tailwind tokens in `main.css`)
need agreement between whoever produces them and whoever consumes them **before** the change
is made.

## Branches and pull requests

- One Issue = one branch = one PR.
- Branch from `dev`, named `<prefix>/<kebab-name>` (`feat/`, `fix/`, `docs/`, `chore/`).
- Open the PR into `dev`. Never commit directly to `main` or `dev`.
- The PR references the Issue (`Refs #12`), lists the modules touched, shared
  contracts affected, checks run (with real results) and what was **not** verified.
- CI (`.github/workflows/frontend-ci.yml`) runs `npm run lint:oxlint`, `npm run lint:eslint`
  and `npm run build` (type-check + Vite build). Run them locally first, plus `npm run format`.
- Don't force-push a branch someone else is working on.

## Splitting a large Issue (optional)

For work that spans several modules or people (or AI agents):

1. One owner splits the main Issue into linked sub-Issues, each with scope,
   contracts, acceptance criteria and dependencies.
2. Define shared interfaces first: TypeScript types, routes, service signatures, merge order.
3. Each person or agent works on its own branch and opens its own PR. Agents on
   the same machine need separate git worktrees or clones, never the same directory.
4. A designated integrator merges the PRs into an integration branch and runs
   `npm run build` and the lint scripts.
5. The final PR references the main Issue and all sub-Issues. Don't close
   anything before the combined verification passes.

## Collisions

If you find two changes overlapping:

1. Stop editing the conflicting files.
2. Record it in the Issue or PR.
3. Agree on who owns the interface, how files are split, or the order of work.
4. Re-plan, then resume.

Merge conflicts are not the only risk: check for semantic conflicts too
(types vs. backend serializers, route names, store shape). Changes to
`src/app/router/index.ts`, `src/modules/index.ts`, `package.json` / `package-lock.json` and
`.env.example` conflict in small append-only ways: keep both sides; for `package-lock.json`
keep either side and run `npm install` again.

## Tooling access

Whether an assistant can read or update Projects, Issues and PRs depends on the
tools and permissions enabled. Check access before promising updates; without it,
report manually. Use least-privilege tokens and never commit them.
