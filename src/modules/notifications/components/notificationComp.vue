<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { listenForForegroundMessages, requestDeviceFcmToken } from '../composables'
import { sendNotification, validateNotificationsConfiguration } from '../services'

const isSending = ref(false)
const notification = {
  title: 'ResenhaCoders',
  body: 'Esta é uma notificação de teste enviada pelo Firebase Cloud Messaging.',
}

let stopListeningForMessages: (() => void) | undefined

async function handleSendNotification(): Promise<void> {
  isSending.value = true

  try {
    validateNotificationsConfiguration()
    const { token, messaging } = await requestDeviceFcmToken()

    if (!stopListeningForMessages) {
      stopListeningForMessages = listenForForegroundMessages(messaging, (payload) => {
        const title = payload.notification?.title ?? 'Nova notificação'
        const body = payload.notification?.body
        toast(title, body ? { description: body } : undefined)
      })
    }

    await sendNotification({
      token,
      title: notification.title,
      body: notification.body,
    })

    toast.success('Solicitação enviada. O backend processará o push via FCM.')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Não foi possível enviar a notificação.'
    console.log(message + ' - ' + error)
    toast.error(message)
  } finally {
    isSending.value = false
  }
}

onUnmounted(() => {
  stopListeningForMessages?.()
})
</script>

<template>
  <section
    class="mx-auto w-full max-w-xl rounded-3xl border border-(--outline-variant) bg-(--surface-container-low) p-6 shadow-lg sm:p-8"
  >
    <div
      class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--primary) text-white"
      aria-hidden="true"
    >
      <span class="material-symbols-outlined">notifications</span>
    </div>

    <h1 class="text-2xl font-bold text-(--on-surface)">Notificações</h1>
    <p class="mt-2 text-sm leading-6 text-(--on-surface-variant)">
      Envie uma notificação para este dispositivo usando o Firebase Cloud Messaging. A permissão do
      navegador será solicitada quando você clicar no botão.
    </p>

    <BaseButton
      label="Enviar push de teste"
      icon="send"
      :loading="isSending"
      :disabled="isSending"
      @click="handleSendNotification"
    />
  </section>
</template>
