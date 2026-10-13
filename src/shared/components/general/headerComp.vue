<script setup lang="ts">
import { ThemeSwitcher } from '@/shared/components'
import type { IMenuItems } from '@/shared/types'

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
  <header class="bg-(--surface) px-20 py-2 dark:bg-(--surface-dark)">
    <div
      class="flex items-center justify-between gap-8 px-8 py-2 mx-auto bg-(--surface-container) rounded-full border border-gray-200 dark:bg-(--surface-container-dark) dark:border-gray-700"
    >
      <RouterLink to="/" class="font-bold"
        >Resenha<span
          class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-transparent dark:to-(--primary-dark) dark:from-(--primary-container-dark)"
          >Coders</span
        ></RouterLink
      >

      <nav>
        <ul class="flex items-center gap-8 text-sm dark:text-(--on-surface-variant-dark)">
          <li v-for="(item, index) in menuItems" :key="index">
            <RouterLink :to="item.link">{{ item.label }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-8">
        <ul
          class="flex items-center gap-4 text-sm font-semibold dark:text-(--on-surface-variant-dark)"
        >
          <li v-for="(item, index) in authItems" :key="index">
            <RouterLink
              v-if="item.label == 'Entrar'"
              :to="item.link"
              class="bg-(--primary) text-(--surface-container) px-3 py-1.5 rounded-full flex items-center gap-1 group hover:bg-(--primary)/80 transition-all duration-300"
              ><span
                class="material-symbols-outlined group-hover:translate-x-1 transition-all duration-300"
              >
                login
              </span>
              {{ item.label }}
            </RouterLink>
            <RouterLink v-else :to="item.link">{{ item.label }}</RouterLink>
          </li>
        </ul>
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>
