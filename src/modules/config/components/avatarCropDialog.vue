<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { avatarCrop, clampAvatarZoom } from '../utils/avatarCrop'

const props = defineProps<{ file: File }>()
const emit = defineEmits<{ cancel: []; confirm: [file: File] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const viewport = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const stageSize = ref(0)
const zoom = ref(1)
const ready = ref(false)
const exporting = ref(false)
const error = ref('')
let image: HTMLImageElement | undefined
let imageUrl: string | undefined
let disposed = false
let centerX = 0
let centerY = 0
let resize: ResizeObserver | undefined
const pointers = new Map<number, { x: number; y: number }>()

function draw(): void {
  const context = canvas.value?.getContext('2d')
  if (!image || !ready.value || !context) return
  const crop = avatarCrop(image.naturalWidth, image.naturalHeight, zoom.value, centerX, centerY)
  centerX = crop.x + crop.size / 2
  centerY = crop.y + crop.size / 2
  context.clearRect(0, 0, 512, 512)
  context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, 512, 512)
}

function setZoom(value: number): void {
  if (!ready.value || exporting.value) return
  zoom.value = clampAvatarZoom(value)
  draw()
}

function startDrag(event: PointerEvent): void {
  if (!ready.value || exporting.value || !canvas.value || event.button !== 0) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  canvas.value.setPointerCapture(event.pointerId)
}

function distance(): number {
  const [a, b] = [...pointers.values()]
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
}

function drag(event: PointerEvent): void {
  const point = pointers.get(event.pointerId)
  if (!point || !image || !canvas.value || exporting.value) return
  const before = distance()
  const dx = event.clientX - point.x
  const dy = event.clientY - point.y
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size > 1) {
    if (before > 0) setZoom((zoom.value * distance()) / before)
    return
  }
  const crop = avatarCrop(image.naturalWidth, image.naturalHeight, zoom.value, centerX, centerY)
  const scale = crop.size / canvas.value.getBoundingClientRect().width
  centerX -= dx * scale
  centerY -= dy * scale
  draw()
}

function stopDrag(event: PointerEvent): void {
  pointers.delete(event.pointerId)
}

function moveWithKeyboard(event: KeyboardEvent): void {
  if (!image || !ready.value || exporting.value) return
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    setZoom(zoom.value + 0.2)
    return
  }
  if (event.key === '-') {
    event.preventDefault()
    setZoom(zoom.value - 0.2)
    return
  }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const step = Math.min(image.naturalWidth, image.naturalHeight) / zoom.value / 25
  if (event.key === 'ArrowLeft') centerX -= step
  if (event.key === 'ArrowRight') centerX += step
  if (event.key === 'ArrowUp') centerY -= step
  if (event.key === 'ArrowDown') centerY += step
  draw()
}

function reset(): void {
  if (!image) return
  centerX = image.naturalWidth / 2
  centerY = image.naturalHeight / 2
  zoom.value = 1
  draw()
}

function confirm(): void {
  if (!canvas.value || !ready.value || exporting.value) return
  pointers.clear()
  exporting.value = true
  canvas.value.toBlob((blob) => {
    if (disposed) return
    exporting.value = false
    if (!blob) {
      error.value = 'Não foi possível recortar a foto. Tente outra imagem.'
      return
    }
    emit('confirm', new File([blob], 'profile-photo.png', { type: 'image/png' }))
  }, 'image/png')
}

onMounted(async () => {
  dialog.value?.showModal()
  resize = new ResizeObserver(([entry]) => {
    if (entry)
      stageSize.value = Math.max(
        0,
        Math.floor(Math.min(entry.contentRect.width, entry.contentRect.height)),
      )
  })
  if (viewport.value) resize.observe(viewport.value)
  try {
    imageUrl = URL.createObjectURL(props.file)
    const loaded = new Image()
    loaded.src = imageUrl
    await loaded.decode()
    if (disposed) return
    image = loaded
    ready.value = true
    reset()
  } catch {
    if (!disposed) error.value = 'Não foi possível abrir essa imagem. Escolha outro arquivo.'
  }
})
onBeforeUnmount(() => {
  disposed = true
  resize?.disconnect()
  if (imageUrl) URL.revokeObjectURL(imageUrl)
  dialog.value?.close()
})
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="avatar-crop-title"
    aria-describedby="avatar-crop-help"
    class="m-auto h-[min(40rem,calc(100dvh_-_1.5rem))] w-[calc(100%_-_1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-(--border-default) bg-(--surface) p-4 text-(--text-primary) shadow-xl backdrop:bg-black/70 sm:p-6 dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    @cancel.prevent="emit('cancel')"
  >
    <div class="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
      <header>
        <div class="flex items-center justify-between gap-3">
          <h2 id="avatar-crop-title" class="text-lg font-semibold">Ajustar foto</h2>
          <button
            type="button"
            aria-label="Fechar recorte"
            class="grid size-9 place-items-center rounded-full hover:bg-(--bg-subtle) focus-visible:outline-2 dark:hover:bg-black/30"
            @click="emit('cancel')"
          >
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <p id="avatar-crop-help" class="text-sm text-(--text-muted)">
          Arraste para posicionar. Use pinça ou a roda do mouse para aproximar.
        </p>
      </header>
      <div
        ref="viewport"
        class="flex min-h-0 items-center justify-center overflow-hidden rounded-xl bg-(--bg-subtle) dark:bg-black/30"
      >
        <div
          class="relative shrink-0 overflow-hidden"
          :style="{ width: `${stageSize}px`, height: `${stageSize}px` }"
        >
          <canvas
            ref="canvas"
            width="512"
            height="512"
            tabindex="0"
            role="img"
            aria-label="Prévia da foto. Use as setas para mover e mais ou menos para ajustar o zoom."
            class="size-full touch-none cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-inset active:cursor-grabbing"
            @pointerdown="startDrag"
            @pointermove="drag"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @lostpointercapture="stopDrag"
            @keydown="moveWithKeyboard"
            @wheel.prevent="setZoom(zoom * Math.exp(-$event.deltaY * 0.002))"
          />
          <div
            class="pointer-events-none absolute inset-0 rounded-full border-2 border-white/90 shadow-[0_0_0_100vmax_rgb(0_0_0/0.6)]"
            aria-hidden="true"
          ></div>
          <p
            v-if="!ready && !error"
            role="status"
            class="absolute inset-0 grid place-items-center bg-(--surface) p-4 text-center text-sm dark:bg-(--surface-inverse)"
          >
            Abrindo imagem…
          </p>
        </div>
      </div>
      <footer class="flex flex-col gap-3">
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Diminuir zoom"
            :disabled="!ready || exporting || zoom <= 1"
            class="grid size-10 place-items-center rounded-full border border-(--border-default) disabled:opacity-40 focus-visible:outline-2 dark:border-(--border-inverse)"
            @click="setZoom(zoom - 0.2)"
          >
            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
          </button>
          <span class="w-12 text-center text-xs tabular-nums text-(--text-muted)" aria-live="polite"
            >{{ Math.round(zoom * 100) }}%</span
          >
          <button
            type="button"
            aria-label="Aumentar zoom"
            :disabled="!ready || exporting || zoom >= 5"
            class="grid size-10 place-items-center rounded-full border border-(--border-default) disabled:opacity-40 focus-visible:outline-2 dark:border-(--border-inverse)"
            @click="setZoom(zoom + 0.2)"
          >
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
          <button
            type="button"
            aria-label="Centralizar e restaurar zoom"
            :disabled="!ready || exporting"
            class="grid size-10 place-items-center rounded-full border border-(--border-default) disabled:opacity-40 focus-visible:outline-2 dark:border-(--border-inverse)"
            @click="reset"
          >
            <span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>
          </button>
        </div>
        <p v-if="error" role="alert" class="text-sm text-(--text-muted)">{{ error }}</p>
        <div
          class="flex items-center justify-between gap-3 border-t border-(--border-default) pt-3 dark:border-(--border-inverse)"
        >
          <BaseButton
            label="Cancelar"
            variant="ghost"
            size="sm"
            :full-width="false"
            class="mt-0!"
            @click="emit('cancel')"
          />
          <BaseButton
            label="Usar foto"
            size="sm"
            icon="check"
            :full-width="false"
            :loading="exporting"
            :disabled="!ready"
            class="mt-0!"
            @click="confirm"
          />
        </div>
      </footer>
    </div>
  </dialog>
</template>
