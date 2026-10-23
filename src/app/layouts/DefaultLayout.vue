<script setup lang="ts">
import { HeaderComp, SidebarComp, FooterComp } from '@/shared/components'
</script>

<template>
  <!-- <HeaderComp /> -->
  <main class="flex">
    <SidebarComp />
    <RouterView />
  </main>
  <FooterComp />
</template>
