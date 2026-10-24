<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { useSectorsStore } from '@/modules/module'
import { useOrganizationsStore } from '@/modules/organizations'
import { useChatStore } from '@/modules/chat'
import { useInvitationsStore } from '@/modules/invitations'
import { useNotificationsStore } from '@/modules/notifications'
import { useTheme } from '@/app/composables/useTheme'

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
const { isDark } = useTheme()
const chat = useChatStore()
const invitations = useInvitationsStore()
const isHovered = ref(false)
const isFocused = ref(false)
const isPointerInteraction = ref(false)
const isOpen = computed(() => isHovered.value || isFocused.value)

const current = computed(() => organizations.current)
const switcher = useTemplateRef<HTMLElement>('switcher')
const switcherOpen = ref(false)
onClickOutside(switcher, () => (switcherOpen.value = false))

// Tudo daqui para baixo é da organização selecionada (como no GitHub).
const organizationItems = computed<MenuItem[]>(() => [
  { link: '/', icon: 'home', label: 'Visão geral' },
  { link: '/calendario', icon: 'calendar_month', label: 'Calendário' },
  { link: '/chat', icon: 'chat', label: 'Mensagens' },
  {
    link: '/equipe',
    icon: 'groups',
    label: 'Equipe',
    // a gestão de membros é uma tela à parte, aberta pela própria Equipe
    also: [...(current.value ? [`/organizacoes/${current.value.id}/membros`] : [])],
  },
  { link: '/arquivos', icon: 'folder', label: 'Arquivos' },
  { link: '/relatorios', icon: 'bar_chart', label: 'Relatórios' },
  { link: '/assistente', icon: 'auto_awesome', label: 'Inceptum AI' },
  { link: '/mapbox', icon: 'map', label: 'Mapa' },
])

const accountItems: MenuItem[] = [
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
  active && isOpen.value
    ? 'border-l-[3px] border-(--bg-orange) bg-(--bg-orange)/10 dark:bg-(--bg-orange)/15'
    : 'border-l-[3px] border-transparent hover:bg-(--background-inverse)/30 dark:hover:bg-white/5',
  'group relative flex cursor-pointer items-center justify-start gap-2 rounded-xl px-[5px] py-1.5 text-sm font-medium transition-all duration-300',
]

const iconFrameClass = 'grid size-12 shrink-0 place-items-center'

const iconContainerClass = (active: boolean) => [
  'grid size-10 shrink-0 place-items-center border border-transparent transition-all duration-300 ease-in-out group-hover:scale-105',
  active
    ? 'rounded-xl border-(--bg-orange)/70 bg-(--bg-orange) text-white shadow-[0_4px_16px_rgba(255,122,15,0.28)] ring-4 ring-(--bg-orange)/10'
    : 'rounded-xl group-hover:bg-(--background-inverse)/10',
]

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'
const orgLabel = (name: string, personal: boolean) => (personal ? 'Espaço pessoal' : name)

const visibleSectors = computed(() => sectors.sectors.slice(0, MAX_SECTORS))

// páginas sem guard abrem sem o usuário carregado: confere a sessão
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
  // trocar de organização leva ao dashboard dela
  void router.push('/')
}

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')

function handleSidebarFocusOut(event: FocusEvent) {
  const sidebar = event.currentTarget as HTMLElement
  if (!sidebar.contains(event.relatedTarget as Node | null)) isFocused.value = false
}

function handleSidebarFocusIn() {
  if (!isPointerInteraction.value) isFocused.value = true
}

function handleSidebarPointerDown() {
  isPointerInteraction.value = true
  isFocused.value = false
}

function handleSidebarPointerLeave() {
  isHovered.value = false
  isPointerInteraction.value = false
}

async function signOut() {
  await auth.signOut()
  organizations.organizations = []
  await router.push('/entrar')
}
</script>

<template>
  <aside
    :class="[
      'sticky top-0 hidden h-dvh shrink-0 overflow-x-hidden overflow-y-auto border-r border-(--border-default) bg-(--surface) px-2 py-5 transition-[width] duration-300 ease-in-out md:block dark:border-(--border-inverse) dark:bg-(--surface-inverse)',
      isOpen ? 'w-70' : 'w-20',
    ]"
    aria-label="Barra lateral de navegação"
    @mouseenter="isHovered = true"
    @mouseleave="handleSidebarPointerLeave"
    @pointerdown="handleSidebarPointerDown"
    @pointerup="isPointerInteraction = false"
    @pointercancel="isPointerInteraction = false"
    @focusin="handleSidebarFocusIn"
    @focusout="handleSidebarFocusOut"
  >
    <nav
      aria-label="Navegação principal"
      class="flex min-h-full w-full min-w-[240px] flex-col justify-between gap-6 py-4"
    >
      <div class="grid min-w-0 gap-2">
        <RouterLink
          to="/"
          aria-label="ResenhaCoders — início"
          :title="isOpen ? undefined : 'ResenhaCoders'"
          class="mb-3 flex h-12 items-center justify-start gap-2 px-2 text-2xl font-bold"
        >
          <span class="grid size-12 shrink-0 place-items-center" aria-hidden="true">
            <img src="/icons/logo.svg" alt="" class="size-10 rounded-xl object-cover" />
          </span>
          <img
            :src="isDark ? '/wordmark-inverse.svg' : '/wordmark.svg'"
            alt="ResenhaCoders"
            :aria-hidden="!isOpen"
            :class="[
              'h-auto w-[151px] shrink-0 transition-opacity duration-200',
              isOpen ? 'opacity-100' : 'opacity-0',
            ]"
          />
        </RouterLink>

        <!-- Seletor de organização -->
        <div v-if="auth.user" ref="switcher" class="relative mb-2">
          <button
            type="button"
            :class="[
              'flex cursor-pointer items-center bg-(--surface) text-left transition-all duration-300 dark:bg-(--surface-inverse)',
              isOpen
                ? 'h-12 w-full gap-2 rounded-xl border border-(--border-default) px-2 py-2 dark:border-(--border-inverse)'
                : 'ml-2 size-12 justify-center rounded-2xl border border-(--border-default) p-0 dark:border-(--border-inverse)',
            ]"
            aria-haspopup="listbox"
            :aria-expanded="switcherOpen"
            aria-label="Trocar de organização"
            :title="
              isOpen ? undefined : orgLabel(current?.name ?? '', current?.is_personal ?? false)
            "
            @click="switcherOpen = !switcherOpen"
            @keydown.esc="switcherOpen = false"
          >
            <span class="grid size-12 shrink-0 place-items-center" aria-hidden="true">
              <span
                class="grid size-7 place-items-center rounded-lg border border-white/20 bg-black text-xs font-bold text-white"
                >{{ initial(current?.name ?? '') }}</span
              >
            </span>
            <span v-if="isOpen" class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">
                {{ current ? orgLabel(current.name, current.is_personal) : 'Sem organização' }}
              </span>
              <span class="block truncate text-xs text-(--text-muted)">
                {{ current?.is_personal ? 'Pessoal' : 'Organização' }}
              </span>
            </span>
            <span
              v-if="isOpen"
              class="material-symbols-outlined shrink-0 text-(--text-muted)"
              aria-hidden="true"
              >unfold_more</span
            >
            <span
              v-if="invitations.mine.length"
              class="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-(--bg-orange)"
              :aria-label="`${invitations.mine.length} convites pendentes`"
            />
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
                v-if="invitations.mine.length"
                to="/"
                class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-(--background-inverse)/10 dark:hover:bg-white/5"
                @click="switcherOpen = false"
              >
                <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">mail</span>
                {{ invitations.mine.length }}
                {{ invitations.mine.length === 1 ? 'convite pendente' : 'convites pendentes' }}
              </RouterLink>
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
                :aria-label="item.label"
                :title="isOpen ? undefined : item.label"
              >
                <span :class="iconFrameClass" aria-hidden="true">
                  <span :class="iconContainerClass(isActive(item))">
                    <span
                      :class="[
                        'material-symbols-outlined text-[28px]!',
                        isActive(item) ? 'text-white' : '',
                      ]"
                      >{{ item.icon }}</span
                    >
                  </span>
                </span>
                <span
                  :class="[
                    'min-w-0 flex-1 truncate transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  ]"
                  :aria-hidden="!isOpen"
                  >{{ item.label }}</span
                >
                <span
                  v-if="isOpen && item.link === '/chat' && chat.unreadTotal"
                  class="rounded-full bg-(--bg-orange) px-2 text-xs font-semibold text-white"
                  :aria-label="`${chat.unreadTotal} mensagens não lidas`"
                  >{{ chat.unreadTotal > 99 ? '99+' : chat.unreadTotal }}</span
                >
                <span
                  v-else-if="!isOpen && item.link === '/chat' && chat.unreadTotal"
                  class="absolute right-1 top-1 size-2 rounded-full bg-(--bg-orange)"
                  aria-label="Há mensagens não lidas"
                ></span>
              </RouterLink>
            </li>
          </ul>

          <template v-if="visibleSectors.length">
            <h3
              :class="[
                'mt-3 ml-2 text-xs font-semibold tracking-widest text-(--text-muted) uppercase transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0',
              ]"
              :aria-hidden="!isOpen"
            >
              Setores
            </h3>
            <ul class="grid gap-1">
              <li v-for="sector in visibleSectors" :key="sector.id">
                <RouterLink
                  :to="`/setores/${sector.id}`"
                  :class="itemClass(startsWith(route.path, `/setores/${sector.id}`))"
                  :aria-current="
                    startsWith(route.path, `/setores/${sector.id}`) ? 'page' : undefined
                  "
                  :title="isOpen ? undefined : sector.name"
                  :aria-label="sector.name"
                >
                  <span :class="iconFrameClass" aria-hidden="true">
                    <span
                      :class="[
                        'grid size-10 shrink-0 place-items-center transition-all duration-300 ease-in-out',
                        startsWith(route.path, `/setores/${sector.id}`)
                          ? 'rounded-xl border border-(--bg-orange)/70 bg-(--bg-orange)/15 ring-4 ring-(--bg-orange)/10 shadow-[0_4px_16px_rgba(255,122,15,0.16)]'
                          : 'rounded-full',
                      ]"
                    >
                      <span
                        :class="[
                          'size-3 rounded-full',
                          !sector.color && startsWith(route.path, `/setores/${sector.id}`)
                            ? 'bg-(--bg-orange)'
                            : 'bg-(--text-muted)',
                        ]"
                        :style="sector.color ? { backgroundColor: sector.color } : undefined"
                      ></span>
                    </span>
                  </span>
                  <span
                    :class="[
                      'min-w-0 flex-1 truncate transition-opacity duration-200',
                      isOpen ? 'opacity-100' : 'opacity-0',
                    ]"
                    :aria-hidden="!isOpen"
                    >{{ sector.name }}</span
                  >
                </RouterLink>
              </li>
            </ul>
          </template>
        </template>
        <ul v-else class="grid gap-1">
          <li v-for="item in authItems" :key="item.link">
            <RouterLink
              :to="item.link"
              :class="itemClass(isActive(item))"
              :aria-label="item.label"
              :title="isOpen ? undefined : item.label"
            >
              <span :class="iconFrameClass" aria-hidden="true">
                <span :class="iconContainerClass(isActive(item))">
                  <span
                    :class="[
                      'material-symbols-outlined text-[28px]!',
                      isActive(item) ? 'text-white' : '',
                    ]"
                    >{{ item.icon }}</span
                  >
                </span>
              </span>
              <span
                :class="[
                  'min-w-0 flex-1 truncate transition-opacity duration-200',
                  isOpen ? 'opacity-100' : 'opacity-0',
                ]"
                :aria-hidden="!isOpen"
                >{{ item.label }}</span
              >
            </RouterLink>
          </li>
        </ul>
      </div>

      <div v-if="auth.user" class="grid gap-1">
        <h3
          :class="[
            'ml-2 text-xs font-semibold tracking-widest text-(--text-muted) uppercase transition-opacity duration-200',
            isOpen ? 'opacity-100' : 'opacity-0',
          ]"
          :aria-hidden="!isOpen"
        >
          Minha conta
        </h3>
        <ul class="grid gap-1">
          <li v-for="item in accountItems" :key="item.link">
            <RouterLink
              :to="item.link"
              :class="itemClass(isActive(item))"
              :aria-current="isActive(item) ? 'page' : undefined"
              :aria-label="item.label"
              :title="isOpen ? undefined : item.label"
            >
              <span :class="iconFrameClass" aria-hidden="true">
                <span :class="iconContainerClass(isActive(item))">
                  <span
                    :class="[
                      'material-symbols-outlined text-[28px]!',
                      isActive(item) ? 'text-white' : '',
                    ]"
                    >{{ item.icon }}</span
                  >
                </span>
              </span>
              <span
                :class="[
                  'min-w-0 flex-1 truncate transition-opacity duration-200',
                  isOpen ? 'opacity-100' : 'opacity-0',
                ]"
                :aria-hidden="!isOpen"
                >{{ item.label }}</span
              >
              <span
                v-if="isOpen && item.link === '/notificacoes' && notifications.unreadCount"
                class="rounded-full bg-(--bg-orange) px-2 text-xs font-semibold text-white"
                :aria-label="`${notifications.unreadCount} não lidas`"
                >{{ notifications.unreadCount }}</span
              >
              <span
                v-else-if="!isOpen && item.link === '/notificacoes' && notifications.unreadCount"
                class="absolute right-1 top-1 size-2 rounded-full bg-(--bg-orange)"
                aria-label="Há notificações não lidas"
              ></span>
            </RouterLink>
          </li>
        </ul>
        <p
          class="truncate px-16 pt-2 pb-1 text-xs text-(--text-muted) transition-opacity duration-200"
          :class="isOpen ? 'opacity-100' : 'opacity-0'"
          :aria-hidden="!isOpen"
          :title="auth.user.email"
        >
          {{ firstName }} · {{ auth.user.email }}
        </p>
        <button
          type="button"
          :class="[
            'flex cursor-pointer items-center justify-start gap-2 rounded-xl px-2 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-(--background-inverse)/30 dark:hover:bg-white/5',
          ]"
          aria-label="Sair da conta"
          :title="isOpen ? undefined : 'Sair'"
          @click="signOut"
        >
          <span class="grid size-12 shrink-0 place-items-center" aria-hidden="true">
            <span class="material-symbols-outlined text-[28px]!">logout</span>
          </span>
          <span
            :class="['transition-opacity duration-200', isOpen ? 'opacity-100' : 'opacity-0']"
            :aria-hidden="!isOpen"
            >Sair</span
          >
        </button>
      </div>
    </nav>
  </aside>
</template>
