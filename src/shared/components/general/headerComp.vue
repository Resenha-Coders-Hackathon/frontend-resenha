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
    link: '/',
    label: 'Criar conta',
  },
  {
    link: '/entrar',
    label: 'Entrar',
  },
]
</script>

<template>
  <header class="relative z-50 bg-(--surface) md:px-20 md:py-2 dark:bg-(--surface-dark)">
    <div
      class="flex items-center justify-between gap-4 border-b border-gray-200 bg-(--surface-container) px-4 py-3 dark:border-gray-700 dark:bg-(--surface-container-dark) md:rounded-full md:border md:px-8 md:py-2"
    >
      <RouterLink to="/" class="font-bold" @click="closeMenu">
        Resenha<span
          class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-transparent dark:from-(--primary-container-dark) dark:to-(--primary-dark)"
          >Coders</span
        >
      </RouterLink>

      <nav class="hidden md:block">
        <ul class="flex items-center gap-8 text-sm dark:text-(--on-surface-variant-dark)">
          <li v-for="item in menuItems" :key="item.label">
            <RouterLink :to="item.link" class="hover:text-(--primary) active:text-(--primary)">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="hidden items-center gap-6 md:flex">
        <ul
          class="flex items-center gap-4 text-sm font-semibold dark:text-(--on-surface-variant-dark)"
        >
          <li v-for="item in authItems" :key="item.label">
            <RouterLink
              :to="item.link"
              :class="[
                'flex items-center gap-1 transition-all duration-300',
                item.label === 'Entrar'
                  ? 'group rounded-full bg-(--primary) px-3 py-1.5 text-white hover:bg-(--primary)/80 active:bg-(--primary)/80'
                  : 'hover:text-(--primary) active:text-(--primary)',
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

      <div class="flex items-center gap-3 md:hidden">
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
      <button
        v-if="isMenuOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        @click="closeMenu"
      />
    </Transition>

    <Transition name="sidebar">
      <aside
        v-if="isMenuOpen"
        class="fixed right-0 top-0 z-50 flex flex-col h-dvh w-[min(85vw,360px)] overflow-y-auto border-l border-gray-200 bg-(--surface-container) p-6 shadow-2xl dark:border-gray-700 dark:bg-(--surface-container-dark) md:hidden"
      >
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="font-bold" @click="closeMenu">
            Resenha<span
              class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-transparent dark:from-(--primary-container-dark) dark:to-(--primary-dark)"
              >Coders</span
            >
          </RouterLink>

          <button
            class="material-symbols-outlined flex items-center justify-center rounded-full text-(--on-surface) hover:bg-(--surface-container-low) active:bg-(--surface-container-low) dark:text-white dark:hover:bg-(--surface) dark:active:bg-(--surface)"
            @click="closeMenu"
          >
            close
          </button>
        </div>

        <nav class="mt-10">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-(--outline)">
            Navegação
          </p>

          <ul>
            <li v-for="item in menuItems" :key="item.label">
              <RouterLink
                :to="item.link"
                class="block rounded-xl px-4 py-3 text-sm font-medium text-(--on-surface) transition-colors hover:bg-(--surface-container-low) hover:text-(--primary) active:bg-(--surface-container-low) active:text-(--primary) dark:text-white dark:hover:bg-(--surface) dark:hover:text-(--primary-dark) dark:active:bg-(--surface) dark:active:text-(--primary-dark)"
                @click="closeMenu"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="mt-auto mb-5 border-t border-gray-200 pt-6 dark:border-gray-700">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-(--outline)">
            Sua conta
          </p>

          <ul>
            <li v-for="item in authItems" :key="item.label">
              <RouterLink
                :to="item.link"
                :class="[
                  'flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300',
                  item.label === 'Entrar'
                    ? 'bg-(--primary) text-white hover:bg-(--primary)/80 active:bg-(--primary)/80'
                    : 'text-(--on-surface) hover:bg-(--surface-container-low) active:bg-(--surface-container-low) dark:text-white dark:hover:bg-(--surface) dark:active:bg-(--surface)',
                ]"
                @click="closeMenu"
              >
                <span v-if="item.label === 'Entrar'" class="material-symbols-outlined">
                  login
                </span>

                {{ item.label }}
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
