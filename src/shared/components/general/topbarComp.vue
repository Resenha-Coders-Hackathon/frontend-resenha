<script setup lang="ts">
import { computed } from 'vue'
import { useShell } from '../../composables/shell'
import ThemeSwitcher from './themeSwitcher.vue'

/* COMO USAR:
  <TopbarComp :crumbs="['Conta', 'Planos']" />
  A organização atual é colocada na frente do caminho pelo layout; o sino mostra as não lidas.
*/

const props = withDefaults(defineProps<{ crumbs: string[]; searchPlaceholder?: string }>(), {
  searchPlaceholder: 'Buscar tarefas, pessoas, arquivos',
})

const search = defineModel<string>('search', { default: '' })
const shell = useShell()
const path = computed(() =>
  shell.organization.value ? [shell.organization.value, ...props.crumbs] : props.crumbs,
)
</script>

<template>
  <div
    class="flex items-center gap-[12px] border-b border-(--border-default) bg-(--surface) px-[16px] py-[14px] sm:px-[28px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <nav aria-label="Navegação estrutural" class="min-w-0 flex-1">
      <ol class="flex items-center gap-[6px] text-[13px] leading-normal text-(--text-muted)">
        <li v-for="(crumb, index) in path" :key="crumb" class="flex min-w-0 items-center gap-[6px]">
          <span v-if="index > 0" class="material-symbols-outlined text-[15px]!" aria-hidden="true"
            >chevron_right</span
          >
          <span
            :class="[
              'truncate',
              index === path.length - 1
                ? 'font-semibold text-(--text-primary) dark:text-(--text-inverse)'
                : '',
            ]"
            :aria-current="index === path.length - 1 ? 'page' : undefined"
          >
            {{ crumb }}
          </span>
        </li>
      </ol>
    </nav>

    <label
      class="hidden w-[300px] items-center gap-[8px] rounded-[10px] border border-(--border-default) bg-(--bg-subtle) px-[10px] py-[9px] focus-within:border-(--bg-orange) focus-within:ring-2 focus-within:ring-(--bg-orange)/15 md:flex dark:border-(--border-inverse) dark:bg-black/30"
    >
      <span class="material-symbols-outlined text-[17px]! text-(--text-muted)" aria-hidden="true"
        >search</span
      >
      <span class="sr-only">Buscar</span>
      <input
        v-model="search"
        type="search"
        :placeholder="searchPlaceholder"
        class="min-w-0 flex-1 bg-transparent text-[13px] leading-normal outline-none placeholder:text-(--text-muted)"
      />
      <kbd
        class="rounded-[5px] border border-(--border-default) px-[5px] font-mono text-[10px] leading-[16px] text-(--text-muted) dark:border-(--border-inverse)"
        >⌘K</kbd
      >
    </label>

    <span
      class="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-transparent [&_.material-symbols-outlined]:mt-0! [&_.material-symbols-outlined]:text-[18px]! [&_.material-symbols-outlined]:lg:scale-100!"
    >
      <ThemeSwitcher aria-label="Alternar tema" class="grid cursor-pointer place-items-center" />
    </span>

    <RouterLink
      to="/notificacoes"
      class="relative grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-(--border-default) bg-(--surface) transition-colors hover:border-(--bg-orange)/40 hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) dark:border-(--border-inverse) dark:bg-transparent"
      :aria-label="
        shell.unread.value ? `Notificações: ${shell.unread.value} não lidas` : 'Notificações'
      "
    >
      <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">notifications</span>
      <span
        v-if="shell.unread.value"
        class="absolute top-[7px] right-[8px] size-[7px] rounded-full bg-(--bg-orange) ring-2 ring-(--surface) dark:ring-(--surface-inverse)"
        aria-hidden="true"
      ></span>
    </RouterLink>
  </div>
</template>
