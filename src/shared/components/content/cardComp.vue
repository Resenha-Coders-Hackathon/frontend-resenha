<script setup lang="ts">
defineProps<{
  title: string
  data: string | number
  description?: string
}>()
</script>

<template>
  <div
    class="grid w-full gap-1 rounded-[14px] border border-(--border-default) bg-(--surface) px-5 py-4 dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <p class="text-sm text-(--text-muted)">{{ title }}</p>
    <p class="text-2xl font-semibold">{{ data }}</p>
    <p class="text-xs text-(--text-muted)">{{ description }}</p>
  </div>
</template>
