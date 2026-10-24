<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { cameraErrorMessage, captureSize, stopCamera } from '../utils/camera'

const emit = defineEmits<{ cancel: []; confirm: [file: File] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const nativeInput = ref<HTMLInputElement | null>(null)
const opening = ref(false)
const ready = ref(false)
const capturing = ref(false)
const error = ref('')
const facing = ref<'user' | 'environment'>('user')
let stream: MediaStream | null = null
let request = 0
let disposed = false

function stop(): void {
  ready.value = false
  stopCamera(stream)
  stream = null
  if (video.value) video.value.srcObject = null
}

function updateReady(): void {
  ready.value = !!stream && !!video.value?.videoWidth && !!video.value?.videoHeight
}

async function openCamera(): Promise<void> {
  const id = ++request
  stop()
  error.value = ''
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    error.value =
      'A câmera ao vivo exige HTTPS ou localhost e um navegador compatível. Use a câmera do dispositivo ou escolha uma foto.'
    opening.value = false
    return
  }
  opening.value = true
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facing.value },
        width: { ideal: 1280 },
        height: { ideal: 1280 },
      },
    })
    if (disposed || id !== request) {
      stopCamera(acquired)
      return
    }
    stream = acquired
    acquired.getVideoTracks().forEach((track) => {
      track.onended = () => {
        if (!disposed && id === request) {
          stop()
          error.value = 'A câmera foi desconectada. Tente novamente ou escolha uma foto.'
        }
      }
    })
    if (!video.value) {
      stop()
      return
    }
    video.value.srcObject = acquired
    await video.value.play()
    if (disposed || id !== request) return
    updateReady()
  } catch (cause) {
    if (!disposed && id === request) {
      stop()
      error.value = cameraErrorMessage(cause)
    }
  } finally {
    if (!disposed && id === request) opening.value = false
  }
}

function switchCamera(): void {
  facing.value = facing.value === 'user' ? 'environment' : 'user'
  void openCamera()
}

function capture(): void {
  const source = video.value
  if (!source || !ready.value || capturing.value || !source.videoWidth || !source.videoHeight)
    return
  capturing.value = true
  const canvas = document.createElement('canvas')
  const size = captureSize(source.videoWidth, source.videoHeight)
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) {
    error.value = 'Não foi possível capturar a foto. Use a câmera do dispositivo.'
    capturing.value = false
    return
  }
  if (facing.value === 'user') {
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  canvas.toBlob(
    (blob) => {
      if (disposed) return
      capturing.value = false
      if (!blob) {
        error.value = 'Não foi possível capturar a foto. Tente novamente.'
        return
      }
      stop()
      emit('confirm', new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' }))
    },
    'image/jpeg',
    0.9,
  )
}

function chooseNativePhoto(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  ++request
  stop()
  emit('confirm', file)
}

function useNativeCamera(): void {
  ++request
  stop()
  opening.value = false
  error.value =
    'A câmera ao vivo foi pausada. Se cancelar a seleção, use Tentar novamente para reabrir.'
  nativeInput.value?.click()
}

onMounted(() => {
  dialog.value?.showModal()
  void openCamera()
})
onBeforeUnmount(() => {
  disposed = true
  ++request
  stop()
  dialog.value?.close()
})
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="avatar-camera-title"
    aria-describedby="avatar-camera-help"
    class="m-auto h-[min(40rem,calc(100dvh_-_1.5rem))] w-[calc(100%_-_1.5rem)] max-w-md overflow-hidden rounded-2xl border border-(--border-default) bg-(--surface) p-4 text-(--text-primary) shadow-xl backdrop:bg-black/70 dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    @cancel.prevent="emit('cancel')"
  >
    <div class="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
      <header>
        <div class="flex items-center justify-between gap-3">
          <h2 id="avatar-camera-title" class="text-lg font-semibold">Tirar foto</h2>
          <button
            type="button"
            aria-label="Fechar câmera"
            class="grid size-9 shrink-0 place-items-center rounded-full hover:bg-(--bg-subtle) focus-visible:outline-2 dark:hover:bg-black/30"
            @click="emit('cancel')"
          >
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <p id="avatar-camera-help" class="mt-1 text-sm text-(--text-muted)">
          Posicione o rosto. Você poderá ajustar o recorte depois.
        </p>
      </header>
      <div class="relative min-h-0 overflow-hidden rounded-2xl bg-(--bg-subtle) dark:bg-black/30">
        <video
          ref="video"
          autoplay
          muted
          playsinline
          aria-label="Prévia da câmera"
          class="size-full object-contain"
          :class="facing === 'user' ? '-scale-x-100' : ''"
          @loadedmetadata="updateReady"
          @loadeddata="updateReady"
        />
        <p
          v-if="opening"
          role="status"
          class="absolute inset-0 grid place-items-center bg-(--surface)/90 p-4 text-center text-sm dark:bg-(--surface-inverse)/90"
        >
          Aguardando acesso à câmera…
        </p>
      </div>
      <footer class="flex flex-col gap-3">
        <p v-if="error" role="alert" class="text-sm text-(--text-muted)">{{ error }}</p>
        <div class="flex items-center justify-center gap-3">
          <BaseButton
            label="Alternar"
            icon="cameraswitch"
            variant="secondary"
            size="sm"
            :full-width="false"
            :disabled="!ready || opening || capturing"
            class="mt-0!"
            @click="switchCamera"
          />
          <BaseButton
            label="Fotografar"
            icon="photo_camera"
            size="sm"
            :full-width="false"
            :disabled="!ready || opening"
            :loading="capturing"
            class="mt-0!"
            @click="capture"
          />
        </div>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
          <button
            v-if="error"
            type="button"
            :disabled="opening || capturing"
            class="underline focus-visible:outline-2"
            @click="openCamera"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            :disabled="capturing"
            class="underline focus-visible:outline-2"
            @click="useNativeCamera"
          >
            Usar câmera do dispositivo / escolher foto
          </button>
        </div>
        <input
          ref="nativeInput"
          type="file"
          accept="image/*"
          capture="user"
          class="hidden"
          aria-label="Usar câmera do dispositivo"
          @change="chooseNativePhoto"
        />
      </footer>
    </div>
  </dialog>
</template>
