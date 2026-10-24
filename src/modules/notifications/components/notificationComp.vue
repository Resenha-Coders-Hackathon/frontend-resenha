<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { useNotificationsStore } from '../stores'

const notifications = useNotificationsStore()
const isChangingPush = ref(false)
const isSending = ref(false)

onMounted(() => {
  void notifications.load()
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

function formatDate(date: string): string {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <section class="w-full min-w-0 max-w-4xl p-5 md:p-10" aria-labelledby="notifications-title">
    <h1 id="notifications-title" class="text-3xl! leading-tight!">Notificações</h1>
    <p class="mt-2 text-(--text-secondary) dark:text-(--text-inverse-muted)" aria-live="polite">
      {{ notifications.unreadCount }} não lida(s)
    </p>

    <div
      class="mt-5 rounded-xl border border-(--border-default) dark:border-(--border-inverse) bg-(--surface) dark:bg-(--surface-inverse) p-4"
    >
      <p>Receba avisos de atribuições, comentários e menções neste navegador.</p>
      <p class="text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Push {{ notifications.pushEnabled ? 'ativado' : 'desativado' }} neste navegador.
      </p>
      <div class="flex flex-wrap gap-3">
        <BaseButton
          :label="notifications.pushEnabled ? 'Desativar push' : 'Ativar push'"
          :full-width="false"
          :loading="isChangingPush"
          @click="togglePush"
        />
        <BaseButton
          v-if="notifications.pushEnabled"
          label="Enviar push de teste"
          variant="secondary"
          :full-width="false"
          :loading="isSending"
          @click="sendTest"
        />
      </div>
    </div>

    <div class="mb-5 flex flex-wrap items-center gap-3">
      <BaseButton
        label="Todas"
        :variant="notifications.unreadOnly ? 'secondary' : 'primary'"
        :full-width="false"
        :disabled="notifications.isLoading"
        @click="notifications.load(false)"
      />
      <BaseButton
        label="Não lidas"
        :variant="notifications.unreadOnly ? 'primary' : 'secondary'"
        :full-width="false"
        :disabled="notifications.isLoading"
        @click="notifications.load(true)"
      />
      <BaseButton
        label="Atualizar"
        variant="secondary"
        :full-width="false"
        :loading="notifications.isLoading"
        @click="notifications.load()"
      />
      <BaseButton
        label="Marcar todas como lidas"
        variant="ghost"
        :full-width="false"
        :disabled="!notifications.unreadCount"
        @click="notifications.markAllAsRead()"
      />
    </div>

    <p v-if="notifications.error" role="alert" class="mb-4 text-(--destructive)">
      {{ notifications.error }}
    </p>
    <p v-if="notifications.isLoading" role="status">Carregando notificações…</p>
    <p v-else-if="!notifications.items.length">
      Nenhuma notificação {{ notifications.unreadOnly ? 'não lida' : 'por enquanto' }}.
    </p>
    <ul class="grid gap-3" aria-label="Suas notificações">
      <li
        v-for="item in notifications.items"
        :key="item.id"
        class="rounded-xl border border-(--border-default) dark:border-(--border-inverse) bg-(--surface) dark:bg-(--surface-inverse) p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg! leading-normal!">{{ item.title }}</h2>
          <span v-if="!item.is_read" class="text-sm font-semibold">Não lida</span>
        </div>
        <p class="mt-2 whitespace-pre-wrap break-words">{{ item.message }}</p>
        <time
          :datetime="item.created_at"
          class="text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)"
          >{{ formatDate(item.created_at) }}</time
        >
        <BaseButton
          v-if="!item.is_read"
          label="Marcar como lida"
          variant="secondary"
          size="sm"
          :full-width="false"
          @click="notifications.markAsRead(item.id)"
        />
      </li>
    </ul>
    <BaseButton
      v-if="notifications.hasMore"
      label="Carregar mais"
      variant="secondary"
      :loading="notifications.isLoading"
      @click="notifications.loadMore()"
    />
  </section>
</template>
