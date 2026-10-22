<script setup lang="ts">
import { HeaderComp, FooterComp } from '@/shared/components'
</script>

<template>
  <HeaderComp />
  <main>
    <RouterView />
  </main>
  <FooterComp />
</template>
