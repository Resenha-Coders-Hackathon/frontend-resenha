<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import type { OrganizationLocation } from '../types'

const props = defineProps<{ disabled: boolean }>()
const location = defineModel<OrganizationLocation | null>({ required: true })
const emit = defineEmits<{ ready: [value: boolean] }>()
const mode = ref<'none' | 'current' | 'search'>('none')
const locating = ref(false)
const searchLoading = ref(false)
const selectedPlace = ref('')
const error = ref('')
const searchContainer = ref<HTMLDivElement>()
let geocoder: MapboxGeocoder | undefined
let revision = 0

const ready = computed(() => !locating.value && (mode.value === 'none' || !!location.value))
watch(ready, (value) => emit('ready', value), { immediate: true })

function disposeSearch() {
  geocoder?.onRemove()
  geocoder = undefined
}

function locate() {
  const request = ++revision
  location.value = null
  error.value = ''
  if (!navigator.geolocation) {
    error.value = 'Seu navegador não oferece localização. Digite a localização.'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      if (request !== revision) return
      location.value = { latitude: coords.latitude, longitude: coords.longitude }
      locating.value = false
    },
    (cause) => {
      if (request !== revision) return
      locating.value = false
      error.value =
        cause.code === 1
          ? 'Permita o acesso à localização no navegador ou digite a localização.'
          : 'Não foi possível obter sua localização. Tente novamente ou digite a localização.'
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  )
}

async function openSearch() {
  const request = ++revision
  error.value = ''
  disposeSearch()
  const accessToken = import.meta.env.VITE_MAPBOX_API_KEY?.trim()
  if (!accessToken) {
    error.value = 'A busca está indisponível. Use a localização atual ou escolha não informar.'
    return
  }
  searchLoading.value = true
  try {
    const { default: MapboxGeocoder } = await import('@mapbox/mapbox-gl-geocoder')
    await nextTick()
    if (request !== revision || !searchContainer.value) return
    const instance = new MapboxGeocoder({
      accessToken,
      marker: false,
      placeholder: 'Digite uma cidade, endereço ou lugar',
      language: 'pt-BR',
    })
    instance.addTo(searchContainer.value)
    geocoder = instance
    const input = searchContainer.value.querySelector('input')
    input?.setAttribute('aria-label', 'Buscar localização')
    input?.setAttribute('aria-describedby', 'organization-location-help')
    instance.on('result', ({ result }) => {
      if (request !== revision || props.disabled) return
      const [longitude, latitude] = result.center
      if (longitude === undefined || latitude === undefined) return
      location.value = { latitude, longitude }
      selectedPlace.value = result.place_name
      searchLoading.value = false
      error.value = ''
    })
    instance.on('clear', clearSelection)
    instance.on('loading', () => {
      if (request === revision) searchLoading.value = true
    })
    instance.on('results', (response: unknown) => {
      if (request !== revision) return
      searchLoading.value = false
      if (
        typeof response === 'object' &&
        response &&
        'features' in response &&
        Array.isArray(response.features)
      ) {
        error.value = response.features.length
          ? ''
          : 'Nenhum local encontrado. Tente outro endereço ou cidade.'
      }
    })
    instance.on('error', () => {
      if (request !== revision) return
      searchLoading.value = false
      error.value = 'Não foi possível buscar a localização. Tente novamente.'
    })
  } catch {
    if (request !== revision) return
    disposeSearch()
    error.value = 'Não foi possível abrir a busca. Tente novamente ou use a localização atual.'
  } finally {
    if (request === revision) searchLoading.value = false
  }
}

function clearSelection() {
  if (props.disabled) return
  location.value = null
  selectedPlace.value = ''
  error.value = ''
}

function editSearch(event: Event) {
  if (props.disabled) return
  if (location.value && geocoder && event.target instanceof HTMLInputElement) {
    const input = event.target
    const { value, selectionStart, selectionEnd } = input
    // The geocoder suppresses repeated selections until its previous result is cleared.
    geocoder.clear()
    geocoder.setInput(value)
    input.setSelectionRange(selectionStart, selectionEnd)
  }
  clearSelection()
}

function preventSearchSubmit(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement) event.preventDefault()
}

watch(mode, (value) => {
  revision++
  locating.value = false
  searchLoading.value = false
  selectedPlace.value = ''
  error.value = ''
  disposeSearch()
  location.value = null
  if (value === 'none') return
  else if (value === 'current') locate()
  else void openSearch()
})
onBeforeUnmount(() => {
  revision++
  disposeSearch()
})
</script>

<template>
  <fieldset class="organization-location" :disabled="disabled">
    <legend>Localização <span class="onboarding-optional">(opcional)</span></legend>
    <div class="onboarding-sector-picker organization-location-options">
      <label
        v-for="choice in [
          { value: 'none', label: 'Não informar' },
          { value: 'current', label: 'Localização atual' },
          { value: 'search', label: 'Digitar localização' },
        ]"
        :key="choice.value"
        :class="{ selected: mode === choice.value }"
      >
        <input v-model="mode" type="radio" name="organization-location" :value="choice.value" />
        {{ choice.label }}
      </label>
    </div>
    <p v-if="mode === 'none'" class="organization-location-hint">
      Você pode cadastrar a organização sem uma localização.
    </p>
    <p v-if="locating || searchLoading" class="organization-location-hint" role="status">
      {{ locating ? 'Obtendo sua localização…' : 'Buscando localização…' }}
    </p>
    <div
      v-if="mode === 'search'"
      :inert="disabled"
      class="organization-location-search-area"
      @keydown.enter="preventSearchSubmit"
      @input="editSearch"
    >
      <p id="organization-location-help" class="organization-location-hint">
        Digite a localização e selecione uma das sugestões.
      </p>
      <div ref="searchContainer" class="organization-location-search" />
    </div>
    <p v-if="location && mode !== 'none'" class="organization-location-hint" role="status">
      {{ mode === 'current' ? 'Localização atual obtida.' : selectedPlace }}
    </p>
    <p v-if="error" class="onboarding-error" role="alert">{{ error }}</p>
    <button
      v-if="error && mode !== 'none'"
      type="button"
      class="onboarding-skip"
      @click="mode === 'current' ? locate() : openSearch()"
    >
      Tentar novamente
    </button>
  </fieldset>
</template>
