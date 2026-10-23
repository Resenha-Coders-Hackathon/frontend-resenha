---
name: figma-interface
description: Implement and review Vue interfaces against the Inceptum Figma design, reusing the frontend components and tokens. Use for Figma screens, components, responsive layouts and visual fidelity fixes.
---

You specialize in translating inspected Figma designs into this repository's Vue 3,
TypeScript and Tailwind CSS 4 interfaces. Complete the requested screen and verify its
appearance and behavior using the smallest change that satisfies the task.

## Start with repository and design evidence

Read `AGENTS.md`, `docs/FIGMA_REFERENCE.md`, `docs/CONVENTIONS.md`,
`docs/PROJECT_GUIDE.md` and `docs/TEAM_WORKFLOW.md`. Check the current branch, local
changes, task scope and overlapping work. Preserve other contributors' changes.
Inspect `package.json` and real components before relying on older documentation.

The default design file is `ylOa2V5UJmvnx85NWv3rUf`, entry node `0:1`.
Use the specific frame URL supplied by the task when available. The entry node is a
starting point, not a screen specification. Figma access was blocked on 2026-10-23;
recheck access and never interpret this reference as extracted design measurements.

When the Figma plugin is available, create a file session before reading and reuse its
returned ID. Load `figma-design-to-code` before `get_design_context`, include its name
in `skillNames`, and request a screenshot. Inspect actual child IDs when the result is
sparse, then obtain detailed context for the requested frames. If no screenshot is
returned, call `get_screenshot`. If tools or access are missing, clearly report that
limitation; do not claim to have inspected the frame or invent its appearance.

## Implement within the existing architecture

- Use `<script setup lang="ts">`, typed props/events and the repository naming conventions.
- Reuse suitable components from `@/shared/components` and the current module; inspect
  their APIs first. Reuse Code Connect mappings when present.
- Keep domain logic under `src/modules/<domain>/`. Use public barrels across modules;
  shared code must remain independent of modules.
- Use verified design values and existing theme tokens. Coordinate global token, shared
  component, router/guard, global store, axios, dependency and API contract changes as
  required by `AGENTS.md`; avoid unnecessary changes to these files.
- Adapt generated reference code to Vue and semantic flex/grid layouts. Do not introduce
  React, a new UI library or layers of absolute positioning for a normal page layout.
- Follow the asset download instructions returned by Figma. Preserve local static assets
  and intrinsic SVG dimensions. Do not substitute artwork, embed the design screenshot
  as UI or ship temporary Figma asset URLs. Keep data-supplied imagery dynamic.
- Keep visible copy in pt-BR and code/docs in English. Use mobile-first styling, dark
  theme support, semantic controls, input labels, visible focus and keyboard interaction.
- Wire real actions through existing stores/services and typed shared axios APIs. Views
  must not issue raw HTTP calls. Never read or expose `.env.local` credentials.
- Implement applicable loading, empty, validation and error states. Identify states,
  breakpoints or interactions absent from the inspected design as inferred decisions.

## Verify and deliver

Compare the running screen with the inspected reference at the same viewport. Check
hierarchy, widths, spacing, typography, colors, borders, artwork geometry and interactions.
Check relevant mobile and dark appearances. Fix in-scope mismatches; report unrelated
ones without expanding the task.

Run the relevant `npm run type-check`, `npm run lint` and `npm run build` checks for code
changes. Review changes from auto-fixing lint scripts. Follow the project testing policy
for non-trivial logic; do not claim Vitest ran when the runner is absent. For documentation
alone, review content and links without implying the application was tested.

Update `docs/FIGMA_REFERENCE.md` with verified frame IDs, token mappings, asset paths and
remaining unknowns when new design evidence is obtained. Finish with changed files,
actual validation results, design decisions and any access or visual verification gaps.
