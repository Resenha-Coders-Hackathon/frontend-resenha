<script setup lang="ts">
import { ref } from 'vue'
import { ThemeSwitcher } from '@/shared/components'
import type { IMenuItems } from '@/shared/types'

const isMenuOpen = ref(false)

const closeMenu = () => {
  isMenuOpen.value = false
}

const menuItems: IMenuItems[] = [
  {
    link: '/',
    label: 'Serviços & Soluções',
  },
  {
    link: '/',
    label: 'Rastreamento & Operação',
  },
  {
    link: '/',
    label: 'Planos & Cotação',
  },
  {
    link: '/',
    label: 'Portal do Cliente',
  },
]

const authItems: IMenuItems[] = [
  {
    link: '/registrar',
    label: 'Criar conta',
  },
  {
    link: '/entrar',
    label: 'Entrar',
  },
]
</script>

<template>
  <header class="relative z-1">
    <div
      class="flex inset-x-none w-full xl:w-auto xl:inset-x-30 xl:mt-5 absolute items-center justify-between gap-4 border-b border-(--border-default) bg-(--surface) px-4 py-3 dark:border-(--border-inverse) dark:bg-(--surface-inverse) xl:rounded-full xl:border xl:px-8 xl:py-2"
    >
      <RouterLink to="/" class="font-bold" @click="closeMenu">
        Resenha<span class="shrink-0 whitespace-nowrap text-(--text-muted)">Coders</span>
      </RouterLink>

      <nav class="hidden min-w-0 flex-1 md:block">
        <ul class="flex items-center justify-center gap-3 text-sm lg:gap-6">
          <li v-for="item in menuItems" :key="item.label">
            <RouterLink
              :to="item.link"
              class="hover:text-(--text-muted) active:text-(--text-muted)"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="hidden items-center gap-6 lg:flex">
        <ul
          class="flex items-center gap-4 text-sm font-semibold border-l pl-5 border-gray-200 dark:border-gray-700"
        >
          <li v-for="item in authItems" :key="item.label">
            <RouterLink
              :to="item.link"
              :class="[
                'flex items-center gap-1',
                item.label === 'Entrar'
                  ? 'group rounded-full bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary) px-3 py-1.5 transition-all duration-300'
                  : 'hover:text-(--text-muted) active:text-(--text-muted)',
              ]"
            >
              {{ item.label }}
              <span
                v-if="item.label === 'Entrar'"
                class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
              >
                login
              </span>
            </RouterLink>
          </li>
        </ul>

        <ThemeSwitcher />
      </div>

      <div class="flex items-center gap-3 lg:hidden">
        <ThemeSwitcher />

        <button
          type="button"
          class="material-symbols-outlined flex items-center justify-center transition-colors"
          @click="isMenuOpen = !isMenuOpen"
        >
          menu
        </button>
      </div>
    </div>

    <Transition name="fade">
      <button v-if="isMenuOpen" class="fixed inset-0 bg-black/40 md:hidden" @click="closeMenu" />
    </Transition>

    <Transition name="sidebar">
      <aside
        v-if="isMenuOpen"
        class="fixed right-0 top-0 z-50 flex flex-col h-dvh w-[min(85vw,360px)] overflow-y-auto border-l border-(--border-default) bg-(--surface) p-6 shadow-2xl dark:border-(--border-inverse) dark:bg-(--surface-inverse) md:hidden"
      >
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="font-bold" @click="closeMenu">
            Resenha<span class="shrink-0 whitespace-nowrap text-(--text-muted)">Coders</span>
          </RouterLink>

          <button
            class="material-symbols-outlined flex items-center justify-center rounded-full"
            @click="closeMenu"
          >
            close
          </button>
        </div>

        <nav class="mt-10">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest">Navegação</p>

          <ul>
            <li v-for="item in menuItems" :key="item.label">
              <RouterLink
                :to="item.link"
                class="block rounded-xl px-4 py-3 text-sm font-medium hover:text-(--text-muted) active:text-(--text-muted)"
                @click="closeMenu"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div
          class="mt-auto mb-5 border-t border-(--border-default) pt-6 dark:border-(--border-inverse)"
        >
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest">Sua conta</p>

          <ul>
            <li v-for="item in authItems" :key="item.label">
              <RouterLink
                :to="item.link"
                :class="[
                  'flex justify-between items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold',
                  item.label === 'Entrar'
                    ? 'group rounded-full bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary) px-3 py-1.5 transition-all duration-300'
                    : 'hover:text-(--text-muted) active:text-(--text-muted)',
                ]"
                @click="closeMenu"
              >
                {{ item.label }}
                <span
                  v-if="item.label === 'Entrar'"
                  class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
                >
                  login
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </aside>
    </Transition>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}
</style>
