import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGeolocationStore = defineStore('geolocation', () => {
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  let watchId: number | null

  function startTracking() {
    if (!('geolocation' in navigator)) {
      return
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        latitude.value = position.coords.latitude
        longitude.value = position.coords.longitude
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            break
          case error.POSITION_UNAVAILABLE:
            break
          case error.TIMEOUT:
            break
          default:
            break
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    )
  }

  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  return {
    latitude,
    longitude,
    startTracking,
    stopTracking,
  }
})
