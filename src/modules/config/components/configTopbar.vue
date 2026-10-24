<script setup lang="ts">
defineProps<{ crumbs: string[] }>()

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div
    class="flex items-center gap-[14px] border-b border-(--border-default) bg-(--surface) px-[16px] py-[14px] sm:px-[28px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <nav aria-label="Navegação estrutural" class="min-w-0 flex-1">
      <ol class="flex items-center gap-[6px] text-[13px] leading-normal text-(--text-muted)">
        <li v-for="(crumb, index) in crumbs" :key="crumb" class="flex items-center gap-[6px]">
          <span v-if="index > 0" class="material-symbols-outlined text-[15px]!" aria-hidden="true"
            >chevron_right</span
          >
          <span
            :class="
              index === crumbs.length - 1
                ? 'font-semibold text-(--text-primary) dark:text-(--text-inverse)'
                : 'truncate'
            "
            :aria-current="index === crumbs.length - 1 ? 'page' : undefined"
          >
            {{ crumb }}
          </span>
        </li>
      </ol>
    </nav>

    <label
      class="hidden w-[280px] items-center gap-[8px] rounded-[10px] border border-(--border-default) bg-(--bg-subtle) px-[10px] py-[9px] focus-within:border-(--border-strong) md:flex dark:border-(--border-inverse) dark:bg-black/30"
    >
      <span class="material-symbols-outlined text-[17px]! text-(--text-muted)" aria-hidden="true"
        >search</span
      >
      <span class="sr-only">Buscar</span>
      <input
        v-model="search"
        type="search"
        placeholder="Buscar…"
        class="min-w-0 flex-1 bg-transparent text-[13px] leading-normal outline-none placeholder:text-(--text-muted)"
      />
      <kbd class="font-mono text-[11px] font-medium text-(--text-muted)">⌘K</kbd>
    </label>

    <button
      type="button"
      class="grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-(--border-default) bg-(--surface) transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-transparent"
      aria-label="Notificações"
    >
      <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">notifications</span>
    </button>
  </div>
</template>
