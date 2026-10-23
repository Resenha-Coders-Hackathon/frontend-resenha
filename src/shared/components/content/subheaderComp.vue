<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex justify-between items-center mb-5">
    <div>
      <h1 class="text-3xl!">{{ title }}</h1>
      <p class="text-sm text-(--text-muted)">{{ description }}</p>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>
