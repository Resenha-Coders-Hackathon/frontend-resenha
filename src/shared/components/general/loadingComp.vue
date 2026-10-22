<script setup lang="ts">
import { useLoading } from '@/shared/composables/loading'

const loading = useLoading()
</script>

<template>
  <template>
    <div
      v-if="loading.loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <img src="/gifs/loading.gif" alt="Carregando..." class="h-50 w-50" />
    </div>
  </template>
</template>
