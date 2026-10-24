<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section
    class="relative flex flex-col gap-[14px] overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) p-[18px] before:absolute before:top-0 before:left-5 before:h-[2px] before:w-7 before:rounded-full before:bg-(--bg-orange)/55 dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <header class="flex items-center justify-between gap-[12px]">
      <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">{{ title }}</h2>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>
