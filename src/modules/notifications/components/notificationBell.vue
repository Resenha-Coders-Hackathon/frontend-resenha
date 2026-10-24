<script setup lang="ts">
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useNotificationsStore } from '../stores'
import { useOpenNotification } from '../composables/useOpenNotification'
import { notificationIcon, notificationTitle, relativeTime } from '../utils'
import type { AppNotification } from '../types'

const notifications = useNotificationsStore()
const openNotification = useOpenNotification()
const isOpen = ref(false)
const root = ref<HTMLElement>()

onClickOutside(root, () => (isOpen.value = false))
watch(isOpen, (open) => open && void notifications.load(false))

async function go(item: AppNotification): Promise<void> {
  isOpen.value = false
  await openNotification(item)
}
</script>

<template>
  <div ref="root" class="relative" @keydown.esc="isOpen = false">
    <button
      type="button"
      class="relative flex size-9 items-center justify-center rounded-lg hover:bg-(--bg-subtle) dark:hover:bg-white/10"
      :aria-label="`Notificações${notifications.unreadCount ? `: ${notifications.unreadCount} não lidas` : ''}`"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="isOpen = !isOpen"
    >
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span
        v-if="notifications.unreadCount"
        class="absolute right-1 top-1 min-w-4 rounded-full bg-(--bg-orange) px-1 text-center text-[10px] font-semibold leading-4 text-white"
        >{{ notifications.unreadCount > 9 ? '9+' : notifications.unreadCount }}</span
      >
    </button>

    <div
      v-if="isOpen"
      role="dialog"
      aria-label="Notificações"
      class="absolute right-0 top-11 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-(--border-default) bg-(--surface) text-(--text-primary) dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    >
      <div
        class="flex items-center justify-between border-b border-(--border-default) px-4 py-3 dark:border-(--border-inverse)"
      >
        <h2 class="text-sm! leading-normal! font-semibold">Notificações</h2>
        <button
          type="button"
          class="text-xs text-(--text-secondary) hover:underline disabled:opacity-40 dark:text-(--text-inverse-muted)"
          :disabled="!notifications.unreadCount"
          @click="notifications.markAllAsRead()"
        >
          Marcar todas como lidas
        </button>
      </div>

      <p v-if="notifications.error" role="alert" class="px-4 py-3 text-sm text-(--destructive)">
        {{ notifications.error }}
      </p>
      <p
        v-else-if="!notifications.items.length"
        class="px-4 py-8 text-center text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        {{ notifications.isLoading ? 'Carregando…' : 'Nada novo por aqui.' }}
      </p>
      <ul v-else class="max-h-96 overflow-y-auto">
        <li v-for="item in notifications.items.slice(0, 8)" :key="item.id">
          <button
            type="button"
            class="flex w-full gap-3 px-4 py-3 text-left hover:bg-(--bg-subtle) dark:hover:bg-white/5"
            @click="go(item)"
          >
            <span
              class="material-symbols-outlined mt-0.5 text-[20px]"
              :class="item.is_read ? 'text-(--text-muted)' : 'text-(--bg-orange)'"
              aria-hidden="true"
              >{{ notificationIcon(item.data) }}</span
            >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm" :class="{ 'font-semibold': !item.is_read }">{{
                notificationTitle(item.title)
              }}</span>
              <span
                v-if="item.message"
                class="block truncate text-xs text-(--text-secondary) dark:text-(--text-inverse-muted)"
                >{{ item.message }}</span
              >
            </span>
            <time :datetime="item.created_at" class="shrink-0 text-xs text-(--text-muted)">{{
              relativeTime(item.created_at)
            }}</time>
          </button>
        </li>
      </ul>

      <RouterLink
        to="/notificacoes"
        class="block border-t border-(--border-default) px-4 py-3 text-center text-sm hover:underline dark:border-(--border-inverse)"
        @click="isOpen = false"
        >Ver todas as notificações</RouterLink
      >
    </div>
  </div>
</template>
