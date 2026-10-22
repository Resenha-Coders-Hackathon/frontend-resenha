<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FooterComp } from '@/shared/components'

const route = useRoute()
const showFooter = computed(() => !route.matched.some((record) => record.meta.hideFooter))
</script>

<template>
  <main>
    <RouterView />
  </main>
  <FooterComp v-if="showFooter" />
</template>
