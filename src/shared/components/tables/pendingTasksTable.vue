<script setup lang="ts">
defineProps<{
  title: string
  pendingItems?: string[]
}>()
</script>

<template>
  <div
    class="py-3 px-5 border border-(--border-default) rounded-lg w-full bg-(--surface) dark:bg-(--surface-inverse) grid gap-1 hover:-translate-y-2 transition-all duration-300 shadow-xl"
  >
    <h3>{{ title }}</h3>

    <ul>
      <li v-for="(item, index) in pendingItems" :key="index"></li>
    </ul>
  </div>
</template>
