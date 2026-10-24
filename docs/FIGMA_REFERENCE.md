# Figma interface reference

## Design source and verification status

- File: [Inceptum — Kanban de Gestão de Tarefas](https://www.figma.com/design/ylOa2V5UJmvnx85NWv3rUf/Inceptum?node-id=0-1).
- File key: `ylOa2V5UJmvnx85NWv3rUf`.
- Entry node: `0:1`. Inspect its structure to find the requested screen; do not assume it is an implementation frame.
- Access checked: 2026-10-23 through the Figma plugin.
- Result: access restored. Design context and screenshots were retrieved for desktop
  `4:2` (1440 × 1024, “05 · Equipe e setores”) and mobile `6:418`
  (390 × 844, “M05 · Equipe”). The earlier access refusal is resolved.
- The onboarding source is on page `10:2` (“Frontend · App”), not the team-management
  page: `10:161` (F04, organization), `10:231` (F05, invite team), both 1440 × 1024.
  Mobile `32:51` supplies the dark/orange treatment and input/action icons.

This document records the implementation contract and verified repository facts. It does
**not** certify that the entire frontend matches the design. The organization/member
screens use the inspected frames; unrelated pages remain outside that verification.

### Organization and invitation implementation

The current `dev` is the presentation baseline, as requested by the owner. F04/F05
remain a reference for the organization/sector/team steps and available fields;
prototype branding, fixed panel measurements and the mobile dark/orange palette do
not override the existing dev components.

- Organization onboarding reuses `AuthAside`, `AuthSplitLayout`, `AuthField` and
  `BaseButton`, with the same ResenhaCoders branding and global theme tokens as auth.
- Organization lists, members and invitation acceptance reuse `SidebarComp` and
  `FooterComp`; the duplicate Inceptum sidebar was removed.
- Light/dark styling follows the selected application theme, including mobile.
  The form uses the shared layout's relative width and natural scrolling content.
- Creation still starts at the explicit **Criar organização** button. Creating an
  account does not automatically create an organization or enter onboarding.
- API services, authorization, route names and the three existing steps are unchanged.
  Original exported assets remain available, but are not a separate design system.

See [organization onboarding](ORGANIZATION_ONBOARDING.md) for routes, contracts and checks.

## Repository baseline

### Kanban implementation (2026-10-23)

- Inspected desktop board `1:103` (1176 × 1024), header `1:129`, card `1:222`,
  column header `1:209`, task properties `1:1684` and checklist `1:1773`.
  The initial broad board context was sparse; detailed contexts and screenshots
  were retrieved for these child nodes. The two user-supplied PNGs also serve as references.
- Implementation: `src/modules/module/views/KanbanView.vue` and the module's
  existing card/column/subheader components, with dedicated task and column dialogs.
  The existing application sidebar and Material Symbols icon system are reused.
- Store data replaces demo cards. Drag/drop and the drawer status action call
  `useKanbanStore.move`; column customization uses the existing status PATCH service.
  Category changes reload tasks because the backend synchronizes completion dates.
- `--kanban-*` semantic variables in `src/assets/main.css` map the inspected warm
  surfaces, borders, metadata and priority colors to light/dark appearances.
  Dark values, narrow viewport scrolling and the full-width mobile drawer are
  implementation adaptations. They are not claimed as inspected dark/mobile frames.
- Task creation/editing, checklist and comments use existing typed API services.
  External attachment/payment integrations pictured in the reference are not mocked
  as working integrations; the current module has no corresponding service actions.
- Validation: production build/type-check and scoped ESLint passed. Full `npm run lint`
  encounters seven ESLint errors in generated `dev-dist/workbox-7e5eb42b.js`.
  The Node/Chromium check below verifies UI interactions with intercepted API responses;
  it does not certify live backend credentials or permissions.

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
# In another terminal, from frontend-resenha:
node src/modules/module/__tests__/kanban.browser.mjs
```

The browser check uses Chrome installed on Windows, or the `CHROME_PATH` environment
variable. No dependencies were added. It captures desktop/mobile light/dark images in
a temporary directory, checks status persistence requests and rollback, task/column
creation, column editing, checklist, comments, search and viewport overflow.
Vitest remains uninstalled. Live backend acceptance testing remains separate.

Read [AGENTS.md](../AGENTS.md), [project guide](PROJECT_GUIDE.md),
[conventions](CONVENTIONS.md) and [team workflow](TEAM_WORKFLOW.md) before implementing.
Check installed dependencies and current code when those guides differ from the repository.
For example, `package.json` currently lists `vue-sonner`, while older guides mention
`vue3-toastify`; do not install the latter just to follow stale documentation.

| Concern | Existing implementation |
| --- | --- |
| Runtime | Vue 3 SFCs with `<script setup lang="ts">`, Vite, TypeScript |
| Styling | Tailwind CSS 4; `src/assets/main.css` holds theme variables and typography |
| Fonts in repository | Inter and Plus Jakarta Sans; these are not verified Figma fonts |
| Theme | `.dark` variant and `src/app/composables/useTheme.ts` |
| Shared UI | `src/shared/components/` exports buttons, forms and general components through barrels |
| Domain UI | `src/modules/<domain>/components/` and `views/<Name>View.vue` |
| Global layout | `src/app/layouts/` |
| Existing artwork | `public/login.svg`, `public/register.svg`; equivalence to Figma is unverified |
| Data | Typed services using the shared axios client; Pinia for shared state |

Reuse suitable existing components before adding UI. Inspect their props, events, styles
and accessibility rather than assuming a matching name means a matching design.
Keep domain-specific components inside the module. Follow existing barrels and the `@` alias.
Documentation and code are English; visible UI copy is Portuguese (pt-BR).

## Figma inspection and implementation workflow

1. Obtain access through the connected Figma account and create a file session. Reuse its
   returned session ID for subsequent eligible file tools. Do not invent a session ID.
2. Load the `figma-design-to-code` skill before requesting design context. Request context
   with a screenshot and `skillNames: "figma-design-to-code"`, using Vue and TypeScript
   as the target stack. If the entry node is too broad, inspect metadata for actual frame IDs.
3. If context is sparse, correlate children with the screenshot and request the relevant
   child frames. If no screenshot is returned, request one separately before implementing.
4. Record the evidence below for each requested screen. Distinguish measured design facts,
   current repository behavior and proposed adaptations. Recheck the live frame when updating UI.
5. Adapt design output to Vue and the repository architecture. Reuse mapped Code Connect
   components where available. Use normal layout flow, flex/grid and responsive utilities
   instead of copying prototype absolute positioning throughout the page.
6. Map verified colors and typography to existing tokens. Coordinate changes to global
   tokens, shared UI, routing, global stores, axios, dependencies and API contracts under
   the repository rules; do not silently change those contracts.
7. Download actual static assets using the instructions in the Figma context response.
   Keep local assets, preserve their intrinsic dimensions and verify their rendered slots.
   Never use an entire design screenshot as the interface or keep temporary asset URLs.
8. Implement real controls, keyboard access, labels, visible focus, error/loading/empty
   states as applicable, mobile layout and dark mode. Mark states or breakpoints absent
   from Figma as implementation decisions instead of attributing them to the design.
9. Compare the rendered screen against its reference at the same viewport. Check layout,
   typography, spacing, colors, assets and interactions; record remaining differences.

If Figma remains inaccessible, report the blocker and continue only with independently
verified work. Do not invent design measurements or claim visual fidelity.

## Evidence to capture after access is restored

For each requested frame, add its name, node ID, direct URL, inspection date and viewport;
layout structure and dimensions; typography; color/token mappings; spacing, borders,
radii and shadows; component variants and interactive states; asset names and local paths;
responsive/theme behavior; and the target Vue files. Link screenshots or durable local
references when available. Leave unknown values explicitly pending.

## Acceptance and validation

- The implemented screen has inspected frame context and a visual reference.
- Static assets are local, non-empty, correctly positioned and proportioned.
- Controls work with keyboard and pointer, and forms expose labels and errors.
- Responsive and dark appearances are checked; inferred decisions are identified.
- Existing module boundaries and API behavior are preserved.
- Run `npm run type-check`, `npm run lint` and `npm run build` for implementation changes.
  Lint scripts use `--fix`: review their diff for unrelated changes.
- Vitest is not currently installed and there is no `test` script. Report this limitation;
  follow the project testing policy for non-trivial logic when a runner is available.
- Record actual commands, viewport comparisons and unresolved differences. Documentation-only
  updates require link/content review rather than application build claims.

## Specialized agent

The reusable agent is [.claude/agents/figma-interface.md](../.claude/agents/figma-interface.md).
Claude Code can select `figma-interface`; other assistants can read that file as a task brief
together with this reference and `AGENTS.md`. This file does not register a Codex runtime agent.

Example task: “Use figma-interface to implement the frame at <node URL> in the auth module.
Read docs/FIGMA_REFERENCE.md, inspect the live frame, reuse current components and report
visual verification and checks.”
