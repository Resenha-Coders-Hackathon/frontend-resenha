<script setup lang="ts">
import { useTheme } from '@/app/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
    class="group grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-(--border-default) bg-(--surface) text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--bg-orange)/40 hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) active:translate-y-0 active:scale-[0.98] dark:border-(--border-inverse) dark:bg-transparent dark:text-(--text-inverse)"
    @click="toggleTheme"
  >
    <span
      :class="[
        'material-symbols-outlined mt-0! cursor-pointer transition-all duration-300 ease-out group-hover:text-(--bg-orange)',
        isDark ? 'scale-90 rotate-180 lg:scale-120' : 'scale-100 rotate-360 lg:scale-120',
      ]"
    >
      {{ isDark ? 'sunny' : 'bedtime' }}
    </span>
  </button>
</template>
