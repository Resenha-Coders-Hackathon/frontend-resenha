# Shared Components

The UI kit in `src/shared/components/` plus the shared composables. Use these
before writing new markup. Import from the barrel:

```ts
import { BaseButton, BaseInput, ThemeSwitcher } from '@/shared/components'
```

Icons are [Material Symbols](https://fonts.google.com/icons) names (`lock`, `arrow_forward`).

> Only `BaseButton`, `HeaderComp` (desktop bar) and `ThemeSwitcher` already use the
> new neutral tokens. The others still reference the old palette and render
> without colors until they are migrated (see `PROJECT_GUIDE.md`, Known issues).

## buttons/

### `BaseButton`
Main button. Full width by default, has `mt-5` built in. `primary` is inverted
(black on light, white on dark).

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'success'` | `'primary'` |
| `label` | `string` | `''` |
| `icon` | `string` | `''` |
| `iconPosition` | `'left' \| 'right'` | `'right'` |
| `loading` | `boolean` (spinner, disabled) | `false` |
| `disabled` | `boolean` | `false` |
| `fullWidth` | `boolean` | `true` |
| `size` | `'sm' \| 'md'` | `'md'` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |

```vue
<BaseButton label="Enviar" icon="send" :loading="isSending" @click="handleSend" />
```

### `IconButton`
Round icon-only button. Props: `icon` (required), `label` (title + aria-label),
`variant` `'default' | 'primary' | 'danger'`, `size` `'sm' | 'md'`, `disabled`.

### `CategoryButton`
Filter/category pill. Props: `label` (required), `active`, `disabled`.

### `LiveButton`
"Live" indicator button for real-time streams. Props: `label` (default
`'Listen Event Stream'`), `disabled`.

## forms/

All inputs use `v-model`.

### `BaseInput`
Text input with optional leading icon. Props (`IInputs`): `modelValue`, `type`
(`'text'`), `placeholder`, `icon`, `label`, `disabled`, `required`.
`label`/`required` are accepted but not rendered yet.

```vue
<BaseInput v-model="email" label="E-mail" type="email" icon="alternate_email" />
```

### `PasswordInput`
Like `BaseInput` with a show/hide toggle. Same props.

```vue
<PasswordInput v-model="password" label="Senha" icon="lock" />
```

### `SegmentedControl`
Tabs-like single choice. `v-model: string`, `options: { value: string; label: string }[]`.

```vue
<SegmentedControl v-model="profile" :options="[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]" />
```

### `BaseSwitch`
Toggle with title and description. `v-model: boolean`, `label` (required), `description`.

### `PillCheckbox`
Checkbox shaped as a pill. `v-model: boolean`, `label` (required), `icon` (`'check_circle'`).

### `NumberStepper`
`−` / `+` counter. `v-model: number`, `min` (0), `max` (999), `label`, `disabled`.

### `RangerSlider` (range slider)
Two-handle range. `v-model: [number, number]`, `min` (0), `max` (100).
The export name has a typo (`RangerSlider`); the file is `rangeSlider.vue`.

```vue
<RangerSlider v-model="range" :min="0" :max="100" />
```

## general/

### `HeaderComp`
Site header: logo, main menu, auth links, theme toggle; drawer below `lg`.
Menu entries are the `menuItems` / `authItems` constants (`IMenuItems { link, label }`)
inside the component. Already rendered by `DefaultLayout`.

### `ThemeSwitcher`
Light/dark toggle backed by `useTheme()` (`@/app/composables/useTheme`).

### `LoadingComp` (not exported yet)
Full-screen overlay driven by `useLoading()`. Currently broken (nested `<template>`,
missing `/gifs/loading.gif`); import it from the file only after it is fixed and
added to `general/index.ts`.

## Shared composables (`src/shared/composables/`)

| Composable | Returns | Notes |
|------------|---------|-------|
| `useLoading()` (`loading.ts`) | `{ loading, start, stop }` | Global: every caller shares the same `loading` ref |
| `useScreenSize()` (`screenSize.ts`) | `{ isMobile, isTablet, isDesktop }` | `<768`, `768–1023`, `≥1024`, via `@vueuse/core` |

```ts
import { useLoading } from '@/shared/composables/loading'
const { start, stop } = useLoading()
```

## Module components

Components used by one module stay in that module and are not part of this kit:

| Module | Component | Use |
|--------|-----------|-----|
| `auth` | `GoogleButton` | "Google Workspace" button (no action yet) |
| `module` | `HeroSection` | Home hero (empty placeholder) |
| `mapbox` | `MapboxComp` | Full-height 3D map with geocoder |
| `notifications` | `NotificationComp` | Button that registers FCM and sends a test push |

## Layouts (`src/app/layouts/`)

### `DefaultLayout`
`HeaderComp` + `<main><RouterView /></main>`. Used as the parent component of
every route group.

## Adding a shared component

1. Only if it has no business meaning and at least two places will use it.
2. File in the right group (`buttons/`, `forms/`, `general/`), `camelCase.vue`.
3. `/* COMO USAR */` block, typed props with defaults, `v-model` pattern from
   [`CONVENTIONS.md`](CONVENTIONS.md#components), only existing color tokens.
4. Export it in the group's `index.ts`.
5. Document it here.
