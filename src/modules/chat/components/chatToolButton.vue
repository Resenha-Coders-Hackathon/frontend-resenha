<script setup lang="ts">
defineProps<{ icon: string; label: string }>()
</script>

<template>
  <button
    type="button"
    class="grid size-[28px] cursor-pointer place-items-center rounded-[7px] text-(--text-muted) transition-colors hover:bg-(--bg-orange)/10 hover:text-(--bg-orange) dark:hover:bg-(--bg-orange)/15"
    :aria-label="label"
    :title="label"
  >
    <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">{{ icon }}</span>
  </button>
</template>
