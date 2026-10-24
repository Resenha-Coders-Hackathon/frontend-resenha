<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'

interface MenuItem {
  link: string
  label: string
  icon: string
  // outras rotas que pertencem a esta seção (para marcar o item como ativo)
  also?: string[]
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isOpen = ref<boolean>(true)

const groups: { title: string; items: MenuItem[] }[] = [
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
]

const authItems: MenuItem[] = [
  { link: '/entrar', icon: 'login', label: 'Entrar' },
  { link: '/registrar', icon: 'person_add', label: 'Criar conta' },
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

      <div class="grid gap-1">
        <template v-if="auth.user">
          <p class="truncate px-5 pb-1 text-xs text-(--text-muted)" :title="auth.user.email">
            {{ firstName }} · {{ auth.user.email }}
          </p>
          <button
            type="button"
            class="text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300 hover:bg-(--background-inverse)/30 dark:hover:bg-white/5"
            @click="signOut"
          >
            <span class="material-symbols-outlined" aria-hidden="true">logout</span>
            <span>Sair</span>
          </button>
        </template>
        <ul v-else class="grid gap-1">
          <li v-for="item in authItems" :key="item.link">
            <RouterLink :to="item.link" :class="itemClass(item)">
              <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>
