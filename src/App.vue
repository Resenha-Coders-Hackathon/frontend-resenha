<script setup lang="ts">
import { watch } from 'vue'
import { Toaster, toast } from 'vue-sonner'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/app/composables/useTheme'

// inicializa o tema salvo em todas as telas, não só onde existe o ThemeSwitcher
const { isDark } = useTheme()
import { AuthTransitionOverlay, useAuthStore } from '@/modules/auth'
import { finishGoogleConnect } from '@/modules/calendar_sync'
import { useNotificationSession } from '@/modules/notifications'

const auth = useAuthStore()
const route = useRoute()
useNotificationSession(() => auth.user?.id)

watch(
  () => route.meta.transitionGroup,
  (group) => {
    if (group !== 'auth' || !auth.isSigningOut) return

    // Mantém o wipe visível tempo suficiente para completar antes de revelar a tela de entrada.
    const elapsed = Date.now() - auth.signOutStartedAt
    const remaining = Math.max(0, 1100 - elapsed)
    if (remaining) window.setTimeout(auth.finishSignOut, remaining)
    else auth.finishSignOut()
  },
)

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
  <AuthTransitionOverlay
    :visible="auth.isSigningOut"
    eyebrow="Sessão segura"
    title="Encerrando sua"
    highlight="sessão"
    description="Estamos finalizando sua saída e protegendo seus dados. Até a próxima!"
  />
</template>
