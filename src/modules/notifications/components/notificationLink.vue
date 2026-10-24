<script setup lang="ts">
import { useNotificationsStore } from '../stores'

const notifications = useNotificationsStore()
</script>

<template>
  <RouterLink
    to="/notificacoes"
    class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:underline"
    :aria-label="`Notificações: ${notifications.unreadCount} não lidas`"
  >
    <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
    Notificações
    <span
      v-if="notifications.unreadCount"
      class="rounded-full bg-(--surface-inverse) dark:bg-(--surface) px-2 text-(--text-inverse) dark:text-(--text-primary)"
      aria-live="polite"
      >{{ notifications.unreadCount }}</span
    >
  </RouterLink>
</template>
