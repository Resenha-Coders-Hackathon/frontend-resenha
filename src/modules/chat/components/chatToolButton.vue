<script setup lang="ts">
defineProps<{ icon: string; label: string }>()
</script>

<template>
  <button
    type="button"
    class="grid size-[28px] cursor-pointer place-items-center rounded-[7px] text-(--text-muted) transition-colors hover:bg-(--bg-subtle) hover:text-(--text-primary) dark:hover:bg-white/10 dark:hover:text-(--text-inverse)"
    :aria-label="label"
    :title="label"
  >
    <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">{{ icon }}</span>
  </button>
</template>
