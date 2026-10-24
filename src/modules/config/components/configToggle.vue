<script setup lang="ts">
defineProps<{ label: string; description?: string }>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label
    class="flex cursor-pointer items-center justify-between gap-[16px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
  >
    <span class="flex min-w-0 flex-col gap-[2px] leading-normal">
      <span class="text-[13.5px] font-medium">{{ label }}</span>
      <span v-if="description" class="text-[12px] text-(--text-muted)">{{ description }}</span>
    </span>

    <input v-model="model" type="checkbox" role="switch" class="peer sr-only" />
    <span
      class="relative h-[22px] w-[38px] shrink-0 rounded-full bg-(--bg-muted) transition-colors peer-checked:bg-(--bg-orange) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--bg-orange) after:absolute after:top-[3px] after:left-[3px] after:size-[16px] after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-[16px] dark:bg-black/40 dark:peer-checked:bg-(--bg-orange)"
      aria-hidden="true"
    ></span>
  </label>
</template>
