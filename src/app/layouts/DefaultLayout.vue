<script setup lang="ts">
import { FooterComp } from '@/shared/components'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="min-w-0 flex-1">
      <slot><RouterView /></slot>
    </main>
    <FooterComp />
  </div>
</template>
