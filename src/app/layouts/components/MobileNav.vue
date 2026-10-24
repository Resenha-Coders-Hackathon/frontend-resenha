<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { useChatStore } from '@/modules/chat'
import { useNotificationsStore } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'

interface Item {
  to: string
  label: string
  icon: string
  also?: string[]
}

// As quatro telas do dia a dia ficam na barra; o resto abre em "Mais".
const tabs: Item[] = [
  { to: '/home-usuario', label: 'Início', icon: 'home' },
  { to: '/calendario', label: 'Calendário', icon: 'calendar_month' },
  { to: '/chat', label: 'Mensagens', icon: 'chat' },
  { to: '/equipe', label: 'Equipe', icon: 'groups', also: ['/setores', '/organizacoes'] },
]
const more: Item[] = [
  { to: '/arquivos', label: 'Arquivos', icon: 'folder' },
  { to: '/relatorios', label: 'Relatórios', icon: 'bar_chart' },
  { to: '/assistente', label: 'Assistente IA', icon: 'auto_awesome' },
  { to: '/mapbox', label: 'Mapa', icon: 'map' },
  { to: '/notificacoes', label: 'Notificações', icon: 'notifications' },
  {
    to: '/faturamento',
    label: 'Faturamento',
    icon: 'receipt_long',
    also: ['/planos', '/pagamentos'],
  },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings' },
]

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const notifications = useNotificationsStore()
const chat = useChatStore()

const open = ref(false)
watch(
  () => route.fullPath,
  () => (open.value = false),
)

const startsWith = (path: string, base: string) => path === base || path.startsWith(`${base}/`)
const isActive = (item: Item) =>
  [item.to, ...(item.also ?? [])].some((base) => startsWith(route.path, base))
const moreActive = () => more.some(isActive)

function chooseOrganization(id: string) {
  organizations.select(id)
  void router.push('/home-usuario')
}

async function signOut() {
  open.value = false
  await auth.signOut()
  await router.push('/entrar')
}

const tabClass = (active: boolean) => [
  'relative flex flex-1 flex-col items-center gap-[2px] py-[8px] text-[11px] leading-none',
  active ? 'font-semibold text-(--text-primary) dark:text-(--text-inverse)' : 'text-(--text-muted)',
]
</script>

<template>
  <nav
    v-if="auth.user"
    aria-label="Navegação principal"
    class="fixed inset-x-0 bottom-0 z-30 flex border-t border-(--border-default) bg-(--surface) pb-[env(safe-area-inset-bottom)] md:hidden dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <RouterLink
      v-for="item in tabs"
      :key="item.to"
      :to="item.to"
      :class="tabClass(isActive(item))"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <span class="material-symbols-outlined text-[22px]!" aria-hidden="true">{{ item.icon }}</span>
      {{ item.label }}
      <span
        v-if="item.to === '/chat' && chat.unreadTotal"
        class="absolute top-[4px] right-[calc(50%-20px)] grid min-w-[16px] place-items-center rounded-full bg-(--bg-orange) px-1 text-[10px] leading-4 font-semibold text-white"
        :aria-label="`${chat.unreadTotal} mensagens não lidas`"
        >{{ chat.unreadTotal > 99 ? '99+' : chat.unreadTotal }}</span
      >
    </RouterLink>
    <button
      type="button"
      :class="[...tabClass(moreActive() || open), 'relative cursor-pointer']"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="open = !open"
    >
      <span class="material-symbols-outlined text-[22px]!" aria-hidden="true">menu</span>
      Mais
      <span
        v-if="notifications.unreadCount"
        class="absolute top-[6px] right-[calc(50%-18px)] size-[8px] rounded-full bg-(--bg-orange)"
        aria-hidden="true"
      ></span>
    </button>
  </nav>

  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/30 md:hidden"
      aria-hidden="true"
      @click="open = false"
    />
  </Transition>
  <Transition
    enter-active-class="transition-transform duration-200 ease-out"
    leave-active-class="transition-transform duration-150 ease-in"
    enter-from-class="translate-y-full"
    leave-to-class="translate-y-full"
  >
    <div
      v-if="open"
      role="dialog"
      aria-label="Mais opções"
      class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-(--border-default) bg-(--surface) px-[16px] pt-[16px] pb-[calc(16px+env(safe-area-inset-bottom))] text-(--text-primary) md:hidden dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
      @keydown.esc="open = false"
    >
      <label class="grid gap-[6px] text-[12px] text-(--text-muted)">
        Organização
        <select
          :value="organizations.current?.id"
          class="rounded-[10px] border border-(--border-default) bg-transparent px-[12px] py-[10px] text-[14px] text-(--text-primary) dark:border-(--border-inverse) dark:text-(--text-inverse)"
          @change="chooseOrganization(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="organization in organizations.organizations"
            :key="organization.id"
            :value="organization.id"
          >
            {{ organization.is_personal ? `${organization.name} (pessoal)` : organization.name }}
          </option>
        </select>
      </label>

      <ul class="mt-[8px] grid">
        <li v-for="item in more" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-[12px] rounded-[10px] px-[4px] py-[12px] text-[15px]"
            :class="isActive(item) ? 'font-semibold' : ''"
          >
            <span class="material-symbols-outlined text-[22px]!" aria-hidden="true">{{
              item.icon
            }}</span>
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.to === '/notificacoes' && notifications.unreadCount"
              class="rounded-full bg-(--bg-orange) px-[8px] text-[12px] font-semibold text-white"
              >{{ notifications.unreadCount }}</span
            >
          </RouterLink>
        </li>
      </ul>

      <div
        class="mt-[8px] flex items-center justify-between gap-[12px] border-t border-(--border-default) pt-[12px] dark:border-(--border-inverse)"
      >
        <span class="min-w-0 text-[13px] leading-normal text-(--text-muted)">
          <span
            class="block truncate font-medium text-(--text-primary) dark:text-(--text-inverse)"
            >{{ auth.user?.name }}</span
          >
          <span class="block truncate">{{ auth.user?.email }}</span>
        </span>
        <button
          type="button"
          class="flex shrink-0 cursor-pointer items-center gap-[6px] rounded-[10px] border border-(--border-default) px-[12px] py-[8px] text-[14px] dark:border-(--border-inverse)"
          @click="signOut"
        >
          <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">logout</span>
          Sair
        </button>
      </div>
    </div>
  </Transition>
</template>
