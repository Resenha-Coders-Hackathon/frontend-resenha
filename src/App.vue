<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import { useTheme } from '@/app/composables/useTheme'

// inicializa o tema salvo em todas as telas, não só onde existe o ThemeSwitcher
const { isDark } = useTheme()
</script>

<template>
  <RouterView />
  <Toaster :theme="isDark ? 'dark' : 'light'" />
</template>
