<script setup lang="ts">
defineProps<{
  title: string
  data: string | number
  description?: string
  /** Cor da descrição: verde para melhora, vermelho para piora. */
  tone?: 'good' | 'bad'
}>()
</script>

<template>
  <div
    class="group relative grid w-full gap-1 overflow-hidden rounded-[14px] border border-(--border-default) bg-(--surface) px-5 py-4 transition-all duration-300 before:absolute before:top-0 before:left-5 before:h-[2px] before:w-6 before:rounded-full before:bg-(--bg-orange)/55 before:transition-all before:duration-300 hover:border-(--bg-orange)/50 hover:bg-(--bg-orange)/[0.025] hover:shadow-[0_8px_24px_rgba(255,103,0,0.1)] hover:before:w-12 hover:before:bg-(--bg-orange) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <p class="text-sm text-(--text-muted)">{{ title }}</p>
    <p class="text-2xl font-semibold">{{ data }}</p>
    <p
      :class="[
        'text-xs',
        tone === 'good'
          ? 'text-[#127a3e] dark:text-[#7ed9a2]'
          : tone === 'bad'
            ? 'text-[#c42b2b] dark:text-[#ff8a8a]'
            : 'text-(--text-muted)',
      ]"
    >
      {{ description }}
    </p>
  </div>
</template>
