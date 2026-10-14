<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useScreenSize } from '@/shared/composables/screenSize'

mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_API_KEY)

const { isMobile } = useScreenSize()

const mapRef = ref<mapboxgl.Map | null>(null)
const geocoderRef = ref<MapboxGeocoder | null>(null)
const isGeocoderAdded = ref(false)

onMounted(async () => {
  const map = new mapboxgl.Map({
    container: 'map-fixed',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [geolocation.longitude ?? -48.8464, geolocation.latitude ?? -26.3044],
    zoom: 13,
    pitch: 60,
    bearing: -30,
    antialias: true,
    maxBounds: [
      [-49.0, -26.6],
      [-48.4, -25.9],
    ],
  })

  mapRef.value = map

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken!,
    mapboxgl: mapboxgl as unknown as typeof import('mapbox-gl'),
    marker: true,
    placeholder: 'Buscar local...',
  })

  geocoderRef.value = geocoder

  watch(
    isMobile,
    (mobile) => {
      if (mobile) {
        if (isGeocoderAdded.value) {
          map.removeControl(geocoder)
          isGeocoderAdded.value = false
        }
      } else {
        if (!isGeocoderAdded.value) {
          map.addControl(geocoder, 'top-left')
          isGeocoderAdded.value = true
        }
      }
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => {
  const map = mapRef.value
  const geocoder = geocoderRef.value
  if (!map) return
  if (geocoder) {
    if (isGeocoderAdded.value) {
      map.removeControl(geocoder)
      isGeocoderAdded.value = false
    }
  }
  map.remove()
  mapRef.value = null
  geocoderRef.value = null
})
</script>

<template>
  <div class="relative h-dvh w-full md:h-[42vw] min-h-150 overflow-hidden rounded-2xl">
    <div id="map-fixed" class="h-full w-full overflow-hidden md:rounded-2xl"></div>
  </div>
</template>
