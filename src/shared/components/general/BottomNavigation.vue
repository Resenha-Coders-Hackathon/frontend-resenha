<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Usage: render <BottomNavigation /> in the layout with matching bottom padding.
// Override items to reuse the navigation with another set of application routes.
interface INavigationItem {
  label: string
  to: string
  icon: 'board' | 'chat' | 'ai' | 'team' | 'plans'
}

interface IBottomNavigationProps {
  items?: readonly INavigationItem[]
}

withDefaults(defineProps<IBottomNavigationProps>(), {
  items: () => [
    { label: 'Board', to: '/kanban', icon: 'board' },
    { label: 'Chat', to: '/chat', icon: 'chat' },
    { label: 'IA', to: '/assistente', icon: 'ai' },
    { label: 'Equipe', to: '/organizacoes', icon: 'team' },
    { label: 'Planos', to: '/pagamentos', icon: 'plans' },
  ],
})

const iconPaths = {
  board: 'M6 5v9 M12 5v14 M18 5v11',
  chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
  ai: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z',
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  plans: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M3 10h18',
}
</script>

<template>
  <nav
    aria-label="Navegação principal"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-(--border-default) bg-(--surface) px-[8px] pt-[8px] pb-[max(24px,env(safe-area-inset-bottom))] dark:border-(--border-inverse) dark:bg-(--surface-inverse) md:hidden"
  >
    <ul class="flex items-center gap-[4px]">
      <li v-for="item in items" :key="item.to" class="min-w-0 flex-1">
        <RouterLink v-slot="{ href, navigate, isActive }" :to="item.to" custom>
          <a
            :href="href"
            :aria-current="isActive ? 'page' : undefined"
            :class="[
              'flex min-h-[54px] flex-col items-center justify-center gap-[3px] rounded-[12px] text-[11px] leading-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) dark:focus-visible:outline-(--text-inverse)',
              isActive
                ? 'bg-(--background) font-semibold text-(--text-primary) dark:bg-(--background-inverse) dark:text-(--text-inverse)'
                : 'text-(--text-secondary) hover:bg-(--bg-subtle) dark:text-(--text-inverse-muted) dark:hover:bg-(--background-inverse)',
            ]"
            @click="navigate"
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="iconPaths[item.icon]" />
            </svg>
            <span>{{ item.label }}</span>
          </a>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
