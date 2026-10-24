<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useTheme } from '@/app/composables/useTheme'

// inicializa o tema salvo em todas as telas, não só onde existe o ThemeSwitcher
const { isDark } = useTheme()
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
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in" appear>
      <component :is="Component" :key="route.meta.transitionGroup ?? route.path" />
    </Transition>
  </RouterView>
  <Toaster :theme="isDark ? 'dark' : 'light'" />
</template>
