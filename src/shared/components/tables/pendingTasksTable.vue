<script setup lang="ts">
defineProps<{
  title: string
  pendingItems?: string[]
}>()
</script>

<template>
  <div
    class="py-3 px-5 border border-(--border-default) rounded-lg w-full bg-(--surface) dark:bg-(--surface-inverse) grid gap-1 shadow-xl"
  >
    <h3 class="font-semibold text-sm">{{ title }}</h3>

    <ul>
      <li v-for="(item, index) in pendingItems" :key="index"></li>
    </ul>
  </div>
</template>
