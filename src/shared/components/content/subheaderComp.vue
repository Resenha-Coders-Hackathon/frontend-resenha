<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="mb-5 flex items-center justify-between">
    <div class="relative pl-3.5">
      <span
        class="absolute top-1.5 left-0 h-6 w-[3px] rounded-full bg-(--bg-orange)"
        aria-hidden="true"
      ></span>
      <h1 class="text-3xl!">{{ title }}</h1>
      <p class="text-sm text-(--text-muted)">{{ description }}</p>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>
