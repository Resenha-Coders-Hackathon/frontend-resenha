<script setup lang="ts">
import { SidebarComp, FooterComp } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { NotificationLink } from '@/modules/notifications'

const auth = useAuthStore()
</script>

<template>
  <main class="flex">
    <SidebarComp />
    <div class="min-w-0 flex-1">
      <header v-if="auth.user" class="flex justify-end p-3"><NotificationLink /></header>
      <RouterView />
    </div>
  </main>
  <FooterComp />
</template>
