<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IMenuItems } from '@/shared/types'

const route = useRoute()
const isOpen = ref<boolean>(true)

const menuItems: IMenuItems[] = [
  { link: '/organizacoes', label: 'Organizações' },
  {
    link: '/',
    icon: 'home',
    label: 'Home',
  },
  {
    link: '/kanban',
    icon: 'view_kanban',
    label: 'Mural',
  },
  {
    link: '/mapbox',
    label: 'Mapbox',
  },
  {
    link: '/notificacoes',
    label: 'Notificações',
  },
  {
    link: '/pagamento',
    label: 'Pagamento',
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
  <aside
    :class="[
      'bg-(--surface) dark:bg-(--surface-inverse) border-r border-(--border-default) p-5 relative transition-all duration-300 ease-in-out hidden md:block',
      isOpen ? 'w-70' : 'w-20',
    ]"
  >
    <nav class="py-4 flex flex-col justify-between h-full">
      <div class="grid gap-2">
        <RouterLink to="/" class="text-2xl font-bold mb-3">
          Resenha<span class="shrink-0 whitespace-nowrap text-(--text-muted)">Coders</span>
        </RouterLink>

        <h3 class="uppercase font-semibold tracking-widest text-(--text-muted) text-xs ml-1">
          Workspace
        </h3>

        <ul class="grid gap-2">
          <li v-for="(item, index) in menuItems" :key="index">
            <RouterLink
              :to="item.link"
              :class="[
                route.name === item.label
                  ? 'bg-(--background-inverse) text-(--text-inverse)'
                  : 'hover:bg-(--background-inverse)/30',
                'text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300',
              ]"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>

        <h3 class="uppercase font-semibold tracking-widest text-(--text-muted) text-xs ml-1">
          Setores
        </h3>

        <ul class="grid gap-2">
          <li v-for="(item, index) in menuItems" :key="index">
            <RouterLink
              :to="item.link"
              :class="[
                route.name === item.label
                  ? 'bg-(--background-inverse) text-(--text-inverse)'
                  : 'hover:bg-(--background-inverse)/30',
                'text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300',
              ]"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="grid gap-2">
        <h3 class="uppercase font-semibold tracking-widest text-(--text-muted) text-xs ml-1">
          Configurações
        </h3>

        <ul class="grid gap-2">
          <li v-for="(item, index) in authItems" :key="index">
            <RouterLink
              :to="item.link"
              :class="[
                route.name === item.label
                  ? 'bg-(--background-inverse) text-(--text-inverse)'
                  : 'hover:bg-(--background-inverse)/30',
                'text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300',
              ]"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>
