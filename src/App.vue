<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth'
import { useNotificationSession } from '@/modules/notifications'

const auth = useAuthStore()
useNotificationSession(() => auth.user?.id)
</script>

<template>
  <RouterView />
  <Toaster />
</template>
