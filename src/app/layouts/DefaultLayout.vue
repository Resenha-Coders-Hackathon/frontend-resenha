<script setup lang="ts">
import { SidebarComp, FooterComp } from '@/shared/components'
</script>

<template>
  <main class="flex">
    <SidebarComp />
    <RouterView />
  </main>
  <FooterComp />
</template>
