# Shared rules for agents and the team

Using AI and multiple agents is optional. Follow [`docs/TEAM_WORKFLOW.md`](docs/TEAM_WORKFLOW.md),
[`docs/CONVENTIONS.md`](docs/CONVENTIONS.md), [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md)
and [`docs/COMPONENTS.md`](docs/COMPONENTS.md).

The backend lives in `../backend-resenha`. Its API contract (auth, cookies, CSRF,
endpoints) is in `../backend-resenha/docs/PROJECT_GUIDE.md`; never guess an
endpoint or response shape, read it there.

## Before you start
1. Read the Issue: acceptance criteria, owner, scope, dependencies.
2. Check active Issues/PRs for collisions in modules, shared components and
   API contracts. The board does not lock edits.
3. Check `git status`, the current branch and local changes. Never discard
   anyone else's work.
4. Mark the task as in progress if authorized; without access, tell the owner
   instead of claiming an update.

## Limits and isolation
- One branch per Issue/sub-task. Never commit directly to `main` or `dev`.
- Each concurrent agent on the same machine needs its own worktree or clone.
- Edit only the modules/files in scope. Scope changes need prior agreement.
- Changes to `src/app/` (router, HTTP client, layouts, theme), `src/shared/`,
  `src/assets/main.css` tokens, `src/firebase*.ts`, `service-worker/`,
  `vite.config.ts` and dependencies need the owner's approval: every module depends on them.
- Reuse `src/shared/components` before writing new UI. Read `docs/COMPONENTS.md` first.
- Use only the color tokens that exist in `src/assets/main.css` (see
  `docs/PROJECT_GUIDE.md`, section 7). Old tokens like `--primary` are gone.
- Make the smallest working solution. No unrequested abstractions or dependencies.
- Run `npm run type-check` and `npm run lint` and report real results; never
  claim a check you did not run.

## Multiple agents and integration
- Split the main Issue into linked sub-tasks with mostly independent scope
  (usually one module each).
- Define shared interfaces first: types, store shape, API calls, routes, merge order.
- Each agent works on its own branch and opens its own PR; a designated
  integrator merges them into an integration branch when needed.
- Check semantic conflicts beyond merge conflicts (duplicated routes, renamed
  shared props, API contract changes).
- If you overlap with a teammate's or agent's work, stop and coordinate before editing.
- Never force-push another person's branch.

## Delivery
- The PR references the Issue and lists modules changed, shared files touched,
  API contracts used, checks run and open items.
- Finish only after the agreed integration and review.
- Keep authorship and attribution accurate; never invent authorship or hide required disclosure.
- Without GitHub access or write permission, hand over a report for manual updating.
