<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="my-[14px] flex items-center gap-[12px]" role="separator" :aria-label="label">
    <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
    <span class="text-[12px] leading-normal font-medium text-(--text-muted)">
      {{ label }}
    </span>
    <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
  </div>
</template>
