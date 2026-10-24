<script setup lang="ts">
defineProps<{
  title: string
  data: string | number
  description?: string
}>()
</script>

<template>
  <div
    class="py-3 px-5 border border-(--border-default) rounded-lg w-full max-w-100 bg-(--surface) dark:bg-(--surface-inverse) grid gap-1 dark:border-(--border-inverse)"
  >
    <p class="text-sm text-(--text-secondary)">{{ title }}</p>
    <p class="text-2xl font-semibold">{{ data }}</p>
    <p class="text-xs text-(--text-muted)">{{ description }}</p>
  </div>
</template>
