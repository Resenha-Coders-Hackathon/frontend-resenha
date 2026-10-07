<script setup lang="ts">
import { computed } from 'vue'

/* COMO USAR:
  const number = ref<[number, number]>([24, 86])

  <RangerSlider v-model="number" :min="0" :max="100" />
*/

interface Props {
  min?: number
  max?: number
  modelValue: [number, number]
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
})

const emit = defineEmits<{
  'update:modelValue': [value: [number, number]]
}>()

const start = computed(() => props.modelValue[0])
const end = computed(() => props.modelValue[1])

const startPosition = computed(() => {
  return ((start.value - props.min) / (props.max - props.min)) * 100
})

const endPosition = computed(() => {
  return ((end.value - props.min) / (props.max - props.min)) * 100
})

const updateStart = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)

  if (value < end.value) {
    emit('update:modelValue', [value, end.value])
  }
}

const updateEnd = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)

  if (value > start.value) {
    emit('update:modelValue', [start.value, value])
  }
}
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-2xl bg-(--surface-container-low) mt-5 p-5 dark:bg-(--surface-container-low-dark)"
  >
    <div class="flex items-center justify-between">
      <span
        class="text-sm uppercase tracking-wide text-(--on-surface-variant) dark:text-(--on-surface-variant-dark)"
      >
        Bandwidth Window
      </span>

      <span class="rounded-full bg-(--primary) px-2 py-0.5 text-sm text-white">
        {{ start }}% - {{ end }}%
      </span>
    </div>

    <div class="relative py-4">
      <!-- Track -->
      <div class="h-2 w-full overflow-hidden rounded-full bg-(--surface-container-high)">
        <div
          class="h-full rounded-full bg-linear-to-r from-(--primary) via-(--primary-container) to-(--secondary-color)"
          :style="{
            marginLeft: `${startPosition}%`,
            width: `${endPosition - startPosition}%`,
          }"
        />
      </div>

      <!-- Start -->
      <input
        type="range"
        :min="min"
        :max="max"
        :value="start"
        class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--primary) [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        @input="updateStart"
      />

      <!-- End -->
      <input
        type="range"
        :min="min"
        :max="max"
        :value="end"
        class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--secondary-color) [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        @input="updateEnd"
      />
    </div>
  </div>
</template>
