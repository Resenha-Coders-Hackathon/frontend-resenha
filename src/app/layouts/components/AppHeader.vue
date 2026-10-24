<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { ThemeSwitcher } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { NotificationBell } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'

interface Tab {
  to: string
  label: string
  icon: string
  also?: string[]
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()

const switcherOpen = ref(false)
const userOpen = ref(false)
const switcher = ref<HTMLElement>()
const userMenu = ref<HTMLElement>()
onClickOutside(switcher, () => (switcherOpen.value = false))
onClickOutside(userMenu, () => (userOpen.value = false))

const current = computed(() => organizations.current)

// As abas pertencem à organização selecionada, como as de um repositório no GitHub.
const tabs = computed<Tab[]>(() => {
  const base = current.value ? `/organizacoes/${current.value.id}` : ''
  return [
    { to: base || '/organizacoes', label: 'Visão geral', icon: 'home', also: [`${base}/membros`] },
    { to: '/kanban', label: 'Mural', icon: 'view_kanban' },
    { to: '/minhas-tarefas', label: 'Minhas tarefas', icon: 'task_alt' },
    { to: '/chat', label: 'Mensagens', icon: 'chat' },
    { to: '/assistente', label: 'Assistente', icon: 'auto_awesome' },
    { to: '/equipe', label: 'Equipe', icon: 'groups', also: ['/setores'] },
    { to: '/arquivos', label: 'Arquivos', icon: 'folder' },
    { to: '/relatorios', label: 'Relatórios', icon: 'bar_chart' },
    { to: '/mapbox', label: 'Mapa', icon: 'map' },
  ]
})

const startsWith = (path: string, base: string) => path === base || path.startsWith(`${base}/`)
const isActive = (tab: Tab) => [tab.to, ...(tab.also ?? [])].some((b) => startsWith(route.path, b))

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

onMounted(async () => {
  if (!auth.user) await auth.loadUser().catch(() => undefined)
  if (auth.user && !organizations.organizations.length) {
    await organizations.load().catch(() => undefined)
  }
})

function pick(id: string) {
  organizations.select(id)
  switcherOpen.value = false
  void router.push(`/organizacoes/${id}`)
}

async function signOut() {
  userOpen.value = false
  await auth.signOut()
  await router.push('/entrar')
}

const menuButton =
  'flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--bg-subtle) dark:hover:bg-white/10'
const menuPanel =
  'absolute top-11 z-30 rounded-xl border border-(--border-default) bg-(--surface) p-1 dark:border-(--border-inverse) dark:bg-(--surface-inverse)'
const menuItem =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-(--bg-subtle) dark:hover:bg-white/10'
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-(--border-default) bg-(--surface) text-(--text-primary) dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
  >
    <div class="flex h-14 items-center gap-2 px-3 sm:px-5">
      <RouterLink to="/" class="mr-1 text-lg font-bold tracking-tight">
        Resenha<span class="text-(--text-muted)">Coders</span>
      </RouterLink>

      <template v-if="auth.user">
        <span class="text-(--text-muted)" aria-hidden="true">/</span>
        <div ref="switcher" class="relative min-w-0" @keydown.esc="switcherOpen = false">
          <button
            type="button"
            :class="menuButton"
            aria-haspopup="listbox"
            :aria-expanded="switcherOpen"
            @click="switcherOpen = !switcherOpen"
          >
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-md bg-(--bg-orange) text-xs font-semibold text-white"
              aria-hidden="true"
              >{{ current ? initials(current.name) : '?' }}</span
            >
            <span class="max-w-40 truncate text-sm font-semibold">{{
              current?.name ?? 'Escolher organização'
            }}</span>
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
              >unfold_more</span
            >
          </button>
          <div v-if="switcherOpen" :class="[menuPanel, 'left-0 w-72']">
            <p class="px-3 py-2 text-xs text-(--text-muted)">Trocar de organização</p>
            <ul role="listbox" aria-label="Organizações" class="max-h-72 overflow-y-auto">
              <li v-for="organization in organizations.organizations" :key="organization.id">
                <button
                  type="button"
                  role="option"
                  :aria-selected="organization.id === current?.id"
                  :class="menuItem"
                  @click="pick(organization.id)"
                >
                  <span
                    class="flex size-6 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-xs font-semibold text-(--text-primary)"
                    aria-hidden="true"
                    >{{ initials(organization.name) }}</span
                  >
                  <span class="min-w-0 flex-1 truncate">{{
                    organization.is_personal ? `${organization.name} (pessoal)` : organization.name
                  }}</span>
                  <span
                    v-if="organization.id === current?.id"
                    class="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                    >check</span
                  >
                </button>
              </li>
            </ul>
            <div class="mt-1 border-t border-(--border-default) pt-1 dark:border-(--border-inverse)">
              <RouterLink to="/organizacoes" :class="menuItem" @click="switcherOpen = false">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">apartment</span>
                Ver todas
              </RouterLink>
              <RouterLink to="/organizacoes/nova" :class="menuItem" @click="switcherOpen = false">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
                Nova organização
              </RouterLink>
            </div>
          </div>
        </div>
      </template>

      <div class="ml-auto flex items-center gap-1">
        <template v-if="auth.user">
          <NotificationBell />
          <ThemeSwitcher />
          <div ref="userMenu" class="relative" @keydown.esc="userOpen = false">
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full bg-(--surface-inverse) text-xs font-semibold text-(--text-inverse) dark:bg-(--text-inverse) dark:text-(--text-primary)"
              :aria-label="`Conta de ${auth.user.name}`"
              aria-haspopup="menu"
              :aria-expanded="userOpen"
              @click="userOpen = !userOpen"
            >
              {{ initials(auth.user.name) }}
            </button>
            <div v-if="userOpen" :class="[menuPanel, 'right-0 w-64']" role="menu">
              <div class="px-3 py-2">
                <p class="truncate text-sm font-semibold">{{ auth.user.name }}</p>
                <p class="truncate text-xs text-(--text-muted)">{{ auth.user.email }}</p>
              </div>
              <RouterLink to="/configuracoes" :class="menuItem" role="menuitem" @click="userOpen = false">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">settings</span>
                Configurações
              </RouterLink>
              <RouterLink to="/faturamento" :class="menuItem" role="menuitem" @click="userOpen = false">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">receipt_long</span>
                Faturamento
              </RouterLink>
              <button type="button" :class="menuItem" role="menuitem" @click="signOut">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                Sair
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <ThemeSwitcher />
          <RouterLink to="/entrar" :class="menuButton" class="text-sm font-medium">Entrar</RouterLink>
          <RouterLink to="/registrar" :class="menuButton" class="text-sm font-medium">Criar conta</RouterLink>
        </template>
      </div>
    </div>

    <nav v-if="auth.user" aria-label="Organização" class="overflow-x-auto px-2 sm:px-4">
      <ul class="flex min-w-max gap-1">
        <li v-for="tab in tabs" :key="tab.label">
          <RouterLink
            :to="tab.to"
            class="-mb-px flex h-10 items-center gap-2 border-b-2 px-3 text-sm"
            :class="
              isActive(tab)
                ? 'border-(--bg-orange) font-semibold'
                : 'border-transparent text-(--text-secondary) hover:border-(--border-default) hover:text-(--text-primary) dark:text-(--text-inverse-muted) dark:hover:text-(--text-inverse)'
            "
            :aria-current="isActive(tab) ? 'page' : undefined"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{
              tab.icon
            }}</span>
            {{ tab.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
