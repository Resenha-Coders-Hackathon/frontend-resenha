<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { finishGoogleConnect } from '@/modules/calendar_sync'
import { useNotificationSession } from '@/modules/notifications'

const auth = useAuthStore()
useNotificationSession(() => auth.user?.id)

// volta do consentimento do Google (Meet, Drive...)
const router = useRouter()
finishGoogleConnect()
  .then(async (returnTo) => {
    if (returnTo === null) return
    toast.success('Google conectado. Repita a ação que você tinha iniciado.')
    await router.replace(returnTo)
  })
  .catch((e: unknown) =>
    toast.error(e instanceof Error ? e.message : 'Falha ao conectar o Google.'),
  )
</script>

<template>
  <RouterView />
  <Toaster />
</template>
