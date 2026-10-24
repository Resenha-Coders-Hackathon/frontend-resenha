<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { useSectorsStore } from '@/modules/module'
import { useOrganizationsStore } from '@/modules/organizations'
import { useNotificationsStore } from '@/modules/notifications'

interface MenuItem {
  link: string
  label: string
  icon: string
  // outras rotas que pertencem a esta seção (para marcar o item como ativo)
  also?: string[]
}

const MAX_SECTORS = 8

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const sectors = useSectorsStore()
const notifications = useNotificationsStore()
const isOpen = ref<boolean>(true)

const current = computed(() => organizations.current)
const switcher = useTemplateRef<HTMLElement>('switcher')
const switcherOpen = ref(false)
onClickOutside(switcher, () => (switcherOpen.value = false))

// Tudo daqui para baixo é da organização selecionada (como no GitHub).
const organizationItems = computed<MenuItem[]>(() => {
  const id = current.value?.id
  return [
    { link: '/', icon: 'home', label: 'Visão geral' },
    { link: '/kanban', icon: 'view_kanban', label: 'Mural' },
    { link: '/minhas-tarefas', icon: 'task_alt', label: 'Minhas tarefas' },
    { link: '/chat', icon: 'chat', label: 'Mensagens' },
    { link: '/equipe', icon: 'groups', label: 'Equipe', also: ['/setores'] },
    ...(id
      ? [{ link: `/organizacoes/${id}/membros`, icon: 'badge', label: 'Membros' } as MenuItem]
      : []),
    { link: '/arquivos', icon: 'folder', label: 'Arquivos' },
    { link: '/relatorios', icon: 'bar_chart', label: 'Relatórios' },
    { link: '/assistente', icon: 'auto_awesome', label: 'Assistente IA' },
    { link: '/mapbox', icon: 'map', label: 'Mapa' },
  ]
})

const accountItems: MenuItem[] = [
  { link: '/notificacoes', icon: 'notifications', label: 'Notificações' },
  {
    link: '/faturamento',
    icon: 'receipt_long',
    label: 'Faturamento',
    also: ['/planos', '/pagamentos'],
  },
  { link: '/configuracoes', icon: 'settings', label: 'Configurações' },
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

const itemClass = (active: boolean) => [
  active
    ? 'bg-(--background-inverse) text-(--text-inverse) dark:bg-white/10'
    : 'hover:bg-(--background-inverse)/30 dark:hover:bg-white/5',
  'text-sm rounded-xl flex items-center gap-2 px-5 py-1.5 cursor-pointer font-medium transition-all duration-300',
]

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'
const orgLabel = (name: string, personal: boolean) => (personal ? 'Espaço pessoal' : name)

const visibleSectors = computed(() => sectors.sectors.slice(0, MAX_SECTORS))
const selectedSector = computed(() => route.query.setor)

// páginas sem guard (ex.: /kanban) abrem sem o usuário carregado: confere a sessão
onMounted(async () => {
  if (!auth.user) await auth.loadUser().catch(() => undefined)
  if (auth.user && !organizations.organizations.length) {
    await organizations.load().catch(() => undefined)
  }
})

// trocou de organização (ou de conta): os setores do menu passam a ser os dela
watch(
  () => [auth.user?.id, current.value?.id] as const,
  ([user, id]) => {
    if (user && id) void sectors.load(id).catch(() => undefined)
  },
  { immediate: true },
)

function chooseOrganization(id: string) {
  switcherOpen.value = false
  if (id === current.value?.id) return
  organizations.select(id)
  // telas que levam o id da organização na URL acompanham a troca
  if (route.params.organizationId && route.name) {
    void router.push({ name: route.name, params: { ...route.params, organizationId: id } })
  }
}

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')

async function signOut() {
  await auth.signOut()
  organizations.organizations = []
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

        <!-- Seletor de organização -->
        <div v-if="auth.user" ref="switcher" class="relative mb-2">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-(--border-default) px-3 py-2 text-left transition-colors hover:bg-(--background-inverse)/10 dark:border-(--border-inverse) dark:hover:bg-white/5"
            aria-haspopup="listbox"
            :aria-expanded="switcherOpen"
            aria-label="Trocar de organização"
            @click="switcherOpen = !switcherOpen"
            @keydown.esc="switcherOpen = false"
          >
            <span
              class="grid size-7 shrink-0 place-items-center rounded-lg bg-(--background-inverse) text-xs font-bold text-(--text-inverse) dark:bg-white/15"
              aria-hidden="true"
              >{{ initial(current?.name ?? '') }}</span
            >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">
                {{ current ? orgLabel(current.name, current.is_personal) : 'Sem organização' }}
              </span>
              <span class="block truncate text-xs text-(--text-muted)">
                {{ current?.is_personal ? 'Pessoal' : 'Organização' }}
              </span>
            </span>
            <span class="material-symbols-outlined text-(--text-muted)" aria-hidden="true"
              >unfold_more</span
            >
          </button>

          <ul
            v-if="switcherOpen"
            role="listbox"
            aria-label="Organizações"
            class="absolute inset-x-0 top-full z-20 mt-1 grid max-h-72 gap-1 overflow-y-auto rounded-xl border border-(--border-default) bg-(--surface) p-1 shadow-lg dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <li v-for="organization in organizations.organizations" :key="organization.id">
              <button
                type="button"
                role="option"
                :aria-selected="organization.id === current?.id"
                class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-(--background-inverse)/10 dark:hover:bg-white/5"
                @click="chooseOrganization(organization.id)"
              >
                <span
                  class="grid size-6 shrink-0 place-items-center rounded-md bg-(--background-inverse) text-[11px] font-bold text-(--text-inverse) dark:bg-white/15"
                  aria-hidden="true"
                  >{{ initial(organization.name) }}</span
                >
                <span class="min-w-0 flex-1 truncate">
                  {{ orgLabel(organization.name, organization.is_personal) }}
                </span>
                <span
                  v-if="organization.id === current?.id"
                  class="material-symbols-outlined text-[18px]!"
                  aria-hidden="true"
                  >check</span
                >
              </button>
            </li>
            <li class="mt-1 border-t border-(--border-default) pt-1 dark:border-(--border-inverse)">
              <RouterLink
                to="/organizacoes/nova"
                class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-(--background-inverse)/10 dark:hover:bg-white/5"
                @click="switcherOpen = false"
              >
                <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">add</span>
                Nova organização
              </RouterLink>
              <RouterLink
                to="/organizacoes"
                class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-(--background-inverse)/10 dark:hover:bg-white/5"
                @click="switcherOpen = false"
              >
                <span class="material-symbols-outlined text-[18px]!" aria-hidden="true"
                  >apartment</span
                >
                Todas as organizações
              </RouterLink>
            </li>
          </ul>
        </div>

        <template v-if="auth.user">
          <ul class="grid gap-1">
            <li v-for="item in organizationItems" :key="item.link">
              <RouterLink
                :to="item.link"
                :class="itemClass(isActive(item))"
                :aria-current="isActive(item) ? 'page' : undefined"
              >
                <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>

          <template v-if="visibleSectors.length">
            <h3
              class="mt-3 ml-1 text-xs font-semibold tracking-widest text-(--text-muted) uppercase"
            >
              Setores
            </h3>
            <ul class="grid gap-1">
              <li v-for="sector in visibleSectors" :key="sector.id">
                <RouterLink
                  :to="{ path: '/kanban', query: { setor: sector.id } }"
                  :class="itemClass(route.path === '/kanban' && selectedSector === sector.id)"
                >
                  <span
                    class="size-2.5 shrink-0 rounded-full bg-(--text-muted)"
                    :style="sector.color ? { backgroundColor: sector.color } : undefined"
                    aria-hidden="true"
                  />
                  <span class="truncate">{{ sector.name }}</span>
                </RouterLink>
              </li>
            </ul>
          </template>
        </template>
        <ul v-else class="grid gap-1">
          <li v-for="item in authItems" :key="item.link">
            <RouterLink :to="item.link" :class="itemClass(isActive(item))">
              <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div v-if="auth.user" class="grid gap-1">
        <h3 class="ml-1 text-xs font-semibold tracking-widest text-(--text-muted) uppercase">
          Minha conta
        </h3>
        <ul class="grid gap-1">
          <li v-for="item in accountItems" :key="item.link">
            <RouterLink
              :to="item.link"
              :class="itemClass(isActive(item))"
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
              <span class="flex-1">{{ item.label }}</span>
              <span
                v-if="item.link === '/notificacoes' && notifications.unreadCount"
                class="rounded-full bg-(--bg-orange) px-2 text-xs font-semibold text-white"
                :aria-label="`${notifications.unreadCount} não lidas`"
                >{{ notifications.unreadCount }}</span
              >
            </RouterLink>
          </li>
        </ul>
        <p class="truncate px-5 pt-2 pb-1 text-xs text-(--text-muted)" :title="auth.user.email">
          {{ firstName }} · {{ auth.user.email }}
        </p>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-(--background-inverse)/30 dark:hover:bg-white/5"
          @click="signOut"
        >
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  </aside>
</template>
