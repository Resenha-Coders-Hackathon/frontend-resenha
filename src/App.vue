<script setup lang="ts">
import { HeaderComp } from '@/shared/components'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <HeaderComp />
  <RouterView />
  <Toaster />
</template>
