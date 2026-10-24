<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IMenuItems } from '@/shared/types'
import { useAuthStore } from '@/modules/auth'

const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref<boolean>(true)

const menuItems: IMenuItems[] = [
  {
    title: 'Trabalho',
    items: [
      { link: '/', icon: 'home', label: 'Home' },
      { link: '/minhas-tarefas', icon: 'task_alt', label: 'Minhas tarefas' },
      { link: '/kanban', icon: 'view_kanban', label: 'Mural' },
      { link: '/chat', icon: 'chat', label: 'Mensagens' },
      { link: '/assistente', icon: 'auto_awesome', label: 'Assistente IA' },
    ],
  },
  {
    title: 'Organização',
    items: [
      { link: '/organizacoes', icon: 'apartment', label: 'Organizações' },
      { link: '/equipe', icon: 'groups', label: 'Equipe', also: ['/setores'] },
      { link: '/arquivos', icon: 'folder', label: 'Arquivos' },
      { link: '/relatorios', icon: 'bar_chart', label: 'Relatórios' },
      { link: '/mapbox', icon: 'map', label: 'Mapa' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { link: '/notificacoes', icon: 'notifications', label: 'Notificações' },
      {
        link: '/faturamento',
        icon: 'receipt_long',
        label: 'Faturamento',
        also: ['/planos', '/pagamentos'],
      },
      { link: '/configuracoes', icon: 'settings', label: 'Configurações' },
    ],
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

const startsWith = (path: string, base: string) => path === base || path.startsWith(`${base}/`)

function isActive(item: MenuItem): boolean {
  if (item.link === '/') return route.path === '/'
  return [item.link, ...(item.also ?? [])].some((base) => startsWith(route.path, base))
}

const itemClass = (item: MenuItem) => [
  isActive(item)
    ? 'bg-(--background-inverse) text-(--text-inverse) dark:bg-white/10'
    : 'hover:bg-(--background-inverse)/30 dark:hover:bg-white/5',
  'text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300',
]

// páginas sem guard (ex.: /kanban) abrem sem o usuário carregado: confere a sessão
onMounted(() => {
  if (!auth.user) auth.loadUser().catch(() => undefined)
})

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')

async function signOut() {
  await auth.signOut()
  await router.push('/entrar')
}
</script>

<template>
  <aside
    :class="[
      'bg-(--surface) dark:bg-(--surface-inverse) border-r border-(--border-default) dark:border-(--border-inverse) p-5 transition-all duration-300 ease-in-out hidden md:block sticky top-0 h-dvh shrink-0 overflow-y-auto',
      isOpen ? 'w-70' : 'w-20',
    ]"
  >
    <nav class="py-4 flex flex-col justify-between min-h-full gap-6">
      <div class="grid gap-2">
        <RouterLink to="/" class="text-2xl font-bold mb-3">
          Resenha<span class="shrink-0 whitespace-nowrap text-(--text-muted)">Coders</span>
        </RouterLink>

        <template v-for="group in groups" :key="group.title">
          <h3
            class="uppercase font-semibold tracking-widest text-(--text-muted) text-xs ml-1 mt-3 first-of-type:mt-0"
          >
            {{ group.title }}
          </h3>

          <ul class="grid gap-1">
            <li v-for="item in group.items" :key="item.link">
              <RouterLink
                :to="item.link"
                :class="itemClass(item)"
                :aria-current="isActive(item) ? 'page' : undefined"
              >
                <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </template>
      </div>

      <div class="grid gap-2">
        <div></div>
        <div>
          <h4 class="font-semibold">{{ authStore.user?.name }}</h4>
          <p class="text-(--text-muted) text-sm">Admin - Produto</p>
        </div>
      </div>
    </nav>
  </aside>
</template>
