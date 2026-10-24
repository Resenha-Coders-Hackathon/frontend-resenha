<script setup lang="ts">
import '../chat.css'

// "tinted" aplica o destaque laranja do cabeçalho do assistente
withDefaults(defineProps<{ tinted?: boolean }>(), { tinted: false })
</script>

<template>
  <div
    class="flex min-h-0 flex-1 overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <aside
      class="hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-(--border-default) bg-(--bg-subtle) md:flex dark:border-(--border-inverse) dark:bg-black/20"
    >
      <slot name="aside" />
    </aside>

    <section class="flex min-w-0 flex-1 flex-col">
      <header
        :class="[
          'relative flex items-center gap-[12px] border-b border-(--border-default) px-[20px] py-[14px] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-(--bg-orange)/35 dark:border-(--border-inverse)',
          tinted
            ? 'bg-linear-to-r from-(--bg-orange)/[0.06] to-transparent after:bg-(--bg-orange)/35'
            : 'bg-linear-to-r from-(--bg-orange)/[0.06] to-transparent',
        ]"
      >
        <slot name="header" />
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-[20px] py-[18px]">
        <slot />
      </div>

      <footer class="px-[20px] pb-[20px]">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>
