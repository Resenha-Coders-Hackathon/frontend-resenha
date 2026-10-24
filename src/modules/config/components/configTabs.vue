<script setup lang="ts">
import type { ConfigTab, ConfigTabId } from '../types'

const props = defineProps<{ tabs: ConfigTab[] }>()

const active = defineModel<ConfigTabId>({ required: true })

// setas do teclado movem entre as abas (padrão WAI-ARIA de tablist)
function handleKeydown(event: KeyboardEvent) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const index = props.tabs.findIndex((tab) => tab.id === active.value)
  const next = props.tabs[(index + step + props.tabs.length) % props.tabs.length]
  if (!next) return
  active.value = next.id
  document.getElementById(`config-tab-${next.id}`)?.focus()
}
</script>

<template>
  <div
    role="tablist"
    aria-label="Seções das configurações"
    class="flex items-end gap-[22px] overflow-x-auto overflow-y-hidden border-b border-(--border-default) dark:border-(--border-inverse)"
    @keydown="handleKeydown"
  >
    <button
      v-for="tab in tabs"
      :id="`config-tab-${tab.id}`"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="active === tab.id"
      :aria-controls="`config-panel-${tab.id}`"
      :tabindex="active === tab.id ? 0 : -1"
      :class="[
        '-mb-px shrink-0 cursor-pointer border-b-2 py-[10px] text-[14px] leading-normal font-medium whitespace-nowrap transition-colors',
        active === tab.id
          ? 'border-(--text-primary) text-(--text-primary) dark:border-(--text-inverse) dark:text-(--text-inverse)'
          : 'border-transparent text-(--text-muted) hover:text-(--text-secondary) dark:hover:text-(--text-inverse-muted)',
      ]"
      @click="active = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
