<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { useGeolocationStore } from '@/modules/geolocation/stores'

mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_API_KEY)

const geolocation = useGeolocationStore()

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
    // maxBounds: [
    //   [-49.0, -26.6],
    //   [-48.4, -25.9],
    // ],
  })

  mapRef.value = map

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken!,
    mapboxgl: mapboxgl as unknown as typeof import('mapbox-gl'),
    marker: true,
    placeholder: 'Buscar local...',
  })

  map.addControl(geocoder, 'bottom-left')
  geocoderRef.value = geocoder

  map.on('load', async () => {
    // Fonte de elevação
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14,
    })

    // Ativa terreno com exagero
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1 })

    // Hillshade para sombra do relevo
    map.addLayer({
      id: 'hillshade-layer',
      type: 'hillshade',
      source: 'mapbox-dem',
      layout: { visibility: 'visible' },
      paint: {
        'hillshade-exaggeration': 0.5,
      },
    })

    // Prédios 3D
    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      },
      'waterway-label',
    )
  })
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
  <div class="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden">
    <div id="map-fixed" class="h-full w-full overflow-hidden"></div>
  </div>
</template>
