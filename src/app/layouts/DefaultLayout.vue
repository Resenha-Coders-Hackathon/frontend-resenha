<script setup lang="ts">
import { HeaderComp } from '@/shared/components'
</script>

<template>
  <HeaderComp />
  <main class="relative isolate min-h-svh items-center justify-center overflow-hidden">
    <div
      class="pointer-events-none absolute -left-32 -top-20 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(216,81,25,0.65)_0%,rgba(216,81,25,0.25)_35%,transparent_70%)] blur-xl sm:-left-24 sm:-top-24 sm:h-80 sm:w-80 md:h-100 md:w-100"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -right-32 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,111,235,0.5)_0%,rgba(91,111,235,0.2)_35%,transparent_70%)] blur-xl sm:bottom-12 sm:-right-24 sm:h-88 sm:w-88 md:bottom-24 md:h-108 md:w-108"
    />
    <RouterView />
  </main>
</template>
