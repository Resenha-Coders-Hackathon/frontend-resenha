<script setup lang="ts">
import { onMounted } from 'vue'
import { useGeolocationStore } from '../stores'

const geolocation = useGeolocationStore()

onMounted(async () => {
  geolocation.startTracking()
})
</script>

<template>
  <section>latitude: {{ geolocation.latitude }} longitude: {{ geolocation.longitude }}</section>
</template>
