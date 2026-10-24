<script setup lang="ts">
import { onMounted } from 'vue'
import { useGeolocationStore } from '../stores'

const geolocation = useGeolocationStore()

onMounted(async () => {
  geolocation.startTracking()
})
</script>

<template>
  <section
    class="grid min-h-[calc(100dvh-6rem)] items-center justify-center px-5 py-20 sm:px-8 md:py-24"
  >
    <div class="mx-auto w-full max-w-190">
      <div class="mx-auto max-w-3xl text-center">
        <h1
          class="mt-6 text-center text-4xl leading-tight font-bold tracking-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-[1.12]"
        >
          Sua localização,
          <span class="text-(--text-muted)"> em tempo real </span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-150 text-center text-sm leading-6 text-(--on-surface-variant) sm:mt-6 sm:text-base sm:leading-7 dark:text-(--on-surface-variant-dark)"
        >
          Acompanhe suas coordenadas geográficas com precisão e tecnologia para manter sua operação
          sempre conectada.
        </p>
      </div>

      <div class="mt-12 grid gap-4 sm:grid-cols-2">
        <p class="font-semibold text-(--on-surface-variant) dark:text-(--on-surface-variant-dark)">
          Latitude:
          <span class="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">{{
            geolocation.latitude ?? '--'
          }}</span>
        </p>
        <p class="font-semibold text-(--on-surface-variant) dark:text-(--on-surface-variant-dark)">
          Longitude:
          <span class="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">{{
            geolocation.longitude ?? '--'
          }}</span>
        </p>
      </div>
    </div>
  </section>
</template>
