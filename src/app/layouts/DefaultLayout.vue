<script setup lang="ts">
import { computed, provide } from 'vue'
import { SidebarComp, FooterComp } from '@/shared/components'
import { ShellKey } from '@/shared/composables/shell'
import { useNotificationsStore } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'

const notifications = useNotificationsStore()
const organizations = useOrganizationsStore()

provide(ShellKey, {
  organization: computed(() => organizations.current?.name ?? ''),
  unread: computed(() => notifications.unreadCount),
})
</script>

<template>
  <main class="flex items-start">
    <SidebarComp />
    <div class="min-w-0 flex-1">
      <RouterView />
    </div>
  </main>
  <FooterComp />
</template>
