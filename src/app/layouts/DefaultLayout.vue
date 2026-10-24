<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import { SidebarComp, FooterComp } from '@/shared/components'
import MobileNav from './components/MobileNav.vue'
import { ShellKey } from '@/shared/composables/shell'
import { useChatAlerts } from '@/modules/chat'
import { useInvitationsStore } from '@/modules/invitations'
import { useAuthStore } from '@/modules/auth'
import { useNotificationsStore } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'

const notifications = useNotificationsStore()
const organizations = useOrganizationsStore()
useChatAlerts()

// convites recebidos: carrega ao entrar e de novo quando chega uma notificação nova
const auth = useAuthStore()
const invitations = useInvitationsStore()
watch(
  () => [auth.user?.id, notifications.unreadCount] as const,
  ([user]) => {
    if (user) void invitations.loadMine().catch(() => undefined)
    else invitations.mine = []
  },
  { immediate: true },
)

provide(ShellKey, {
  organization: computed(() => organizations.current?.name ?? ''),
  unread: computed(() => notifications.unreadCount),
})
</script>

<template>
  <main class="flex items-start">
    <SidebarComp />
    <div class="min-w-0 flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
      <slot><RouterView /></slot>
    </div>
  </main>
  <!-- <FooterComp /> -->
  <MobileNav />
</template>
