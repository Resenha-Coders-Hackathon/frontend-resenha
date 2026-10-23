<script setup lang="ts">
defineProps<{
  title: string
  data: string | number
  description?: string
}>()
</script>

<template>
  <div
    class="py-3 px-5 border border-(--border-default) rounded-lg w-full max-w-100 bg-(--surface) dark:bg-(--surface-inverse) grid gap-1 hover:-translate-y-2 transition-all duration-300 shadow-xl dark:border-(--border-inverse)"
  >
    <p class="text-sm text-(--text-muted)">{{ title }}</p>
    <p class="text-2xl font-semibold">{{ data }}</p>
    <p class="text-xs text-(--text-muted)">{{ description }}</p>
  </div>
</template>
