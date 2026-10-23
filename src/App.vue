<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { finishGoogleConnect } from '@/modules/chat'
import { useNotificationSession } from '@/modules/notifications'

const auth = useAuthStore()
useNotificationSession(() => auth.user?.id)

// volta do consentimento do Google iniciado pelo botão "Iniciar Meet" do chat
const router = useRouter()
finishGoogleConnect()
  .then(async (connected) => {
    if (!connected) return
    toast.success('Google conectado. Clique em "Iniciar Meet" novamente.')
    await router.replace('/chat')
  })
  .catch((e: unknown) =>
    toast.error(e instanceof Error ? e.message : 'Falha ao conectar o Google.'),
  )
</script>

<template>
  <RouterView />
  <Toaster />
</template>
