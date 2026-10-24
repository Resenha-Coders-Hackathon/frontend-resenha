<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { useNotificationsStore } from '../stores'
import { useOpenNotification } from '../composables/useOpenNotification'
import { notificationIcon, notificationTitle, relativeTime } from '../utils'

const notifications = useNotificationsStore()
const openNotification = useOpenNotification()
const isChangingPush = ref(false)
const isSending = ref(false)

onMounted(() => {
  void notifications.load(false)
})

async function togglePush(): Promise<void> {
  isChangingPush.value = true
  try {
    if (notifications.pushEnabled) await notifications.disablePush()
    else await notifications.enablePush()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível alterar o push.')
  } finally {
    isChangingPush.value = false
  }
}

async function sendTest(): Promise<void> {
  isSending.value = true
  try {
    await notifications.sendTest()
    toast.success('Push enviado ao Firebase. Confira a notificação neste navegador.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o teste.')
  } finally {
    isSending.value = false
  }
}

</script>

<template>
  <section class="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 md:py-10" aria-labelledby="notifications-title">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h1 id="notifications-title" class="text-2xl! leading-tight!">Notificações</h1>
      <BaseButton
        label="Marcar todas como lidas"
        variant="ghost"
        size="sm"
        :full-width="false"
        :disabled="!notifications.unreadCount"
        @click="notifications.markAllAsRead()"
      />
    </div>

    <div class="mt-4 flex gap-1 border-b border-(--border-default) dark:border-(--border-inverse)" role="tablist">
      <button
        v-for="tab in [
          { label: 'Todas', unread: false },
          { label: `Não lidas (${notifications.unreadCount})`, unread: true },
        ]"
        :key="tab.label"
        type="button"
        role="tab"
        :aria-selected="notifications.unreadOnly === tab.unread"
        class="-mb-px border-b-2 px-3 py-2 text-sm"
        :class="
          notifications.unreadOnly === tab.unread
            ? 'border-(--bg-orange) font-semibold'
            : 'border-transparent text-(--text-secondary) hover:text-(--text-primary) dark:text-(--text-inverse-muted)'
        "
        :disabled="notifications.isLoading"
        @click="notifications.load(tab.unread)"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="notifications.error" role="alert" class="mt-4 text-(--destructive)">
      {{ notifications.error }}
    </p>
    <p v-if="notifications.isLoading && !notifications.items.length" role="status" class="mt-6">
      Carregando notificações…
    </p>
    <p
      v-else-if="!notifications.items.length"
      class="mt-6 text-(--text-secondary) dark:text-(--text-inverse-muted)"
    >
      {{
        notifications.unreadOnly
          ? 'Tudo lido. Novas atribuições, comentários e menções aparecem aqui.'
          : 'Nada por enquanto. Atribuições, comentários e menções aparecem aqui.'
      }}
    </p>

    <ul
      v-if="notifications.items.length"
      class="mt-2 divide-y divide-(--border-default) dark:divide-(--border-inverse)"
      aria-label="Suas notificações"
    >
      <li v-for="item in notifications.items" :key="item.id">
        <button
          type="button"
          class="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left hover:bg-(--bg-subtle) dark:hover:bg-white/5"
          @click="openNotification(item)"
        >
          <span
            class="material-symbols-outlined mt-0.5"
            :class="item.is_read ? 'text-(--text-muted)' : 'text-(--bg-orange)'"
            aria-hidden="true"
            >{{ notificationIcon(item.data) }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="block" :class="{ 'font-semibold': !item.is_read }">{{
              notificationTitle(item.title)
            }}</span>
            <span
              v-if="item.message"
              class="block whitespace-pre-wrap break-words text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >{{ item.message }}</span
            >
          </span>
          <time
            :datetime="item.created_at"
            class="shrink-0 text-sm text-(--text-muted)"
            :title="new Date(item.created_at).toLocaleString('pt-BR')"
            >{{ relativeTime(item.created_at) }}</time
          >
        </button>
      </li>
    </ul>
    <BaseButton
      v-if="notifications.hasMore"
      class="mt-4"
      label="Carregar mais"
      variant="secondary"
      :full-width="false"
      :loading="notifications.isLoading"
      @click="notifications.loadMore()"
    />

    <div
      class="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-default) p-4 dark:border-(--border-inverse)"
    >
      <div>
        <h2 class="text-base! leading-snug!">Avisos neste navegador</h2>
        <p class="text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
          {{
            notifications.pushEnabled
              ? 'Você recebe avisos mesmo com a aba fechada.'
              : 'Ative para receber atribuições e menções mesmo com a aba fechada.'
          }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="notifications.pushEnabled"
          label="Enviar teste"
          variant="ghost"
          size="sm"
          :full-width="false"
          :loading="isSending"
          @click="sendTest"
        />
        <BaseButton
          :label="notifications.pushEnabled ? 'Desativar avisos' : 'Ativar avisos'"
          :variant="notifications.pushEnabled ? 'secondary' : 'primary'"
          size="sm"
          :full-width="false"
          :loading="isChangingPush"
          @click="togglePush"
        />
      </div>
    </div>
  </section>
</template>
