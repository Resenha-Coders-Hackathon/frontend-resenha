<script setup lang="ts">
import { computed } from 'vue'

/* COMO USAR:
  const number = ref(0)

  <NumberStepper v-model="number" :min="0" :max="100" label="Número" />
*/

interface Props {
  modelValue?: number
  min?: number
  max?: number
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 999,
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value),
})

const decrement = () => {
  if (value.value > props.min) {
    value.value--
  }
}

const increment = () => {
  if (value.value < props.max) {
    value.value++
  }
}
</script>

<template>
  <div class="mt-5">
    <label
      v-if="label"
      class="mb-2 block text-sm font-medium text-(--on-surface) dark:text-(--on-surface-dark)"
    >
      {{ label }}
    </label>

    <div
      :class="[
        'flex items-center justify-between rounded-2xl bg-(--surface-container-low) px-4 py-3 shadow-inner transition-all duration-300 dark:bg-(--surface-container-low-dark)',
        {
          'cursor-not-allowed opacity-60': disabled,
        },
      ]"
    >
      <button
        type="button"
        :disabled="disabled || value <= min"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-(--surface-container) text-(--on-surface) transition-all duration-300 hover:bg-(--primary) hover:text-white active:bg-(--primary) active:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--surface-container-dark) dark:text-(--on-surface-dark)"
        @click="decrement"
      >
        <span class="material-symbols-outlined text-[20px]"> remove </span>
      </button>

      <span class="text-sm font-semibold text-(--on-surface) dark:text-(--on-surface-dark)">
        {{ value }}
      </span>

      <button
        type="button"
        :disabled="disabled || value >= max"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-(--surface-container) text-(--on-surface) transition-all duration-300 hover:bg-(--primary) hover:text-white active:bg-(--primary) active:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--surface-container-dark) dark:text-(--on-surface-dark)"
        @click="increment"
      >
        <span class="material-symbols-outlined text-[20px]"> add </span>
      </button>
    </div>
  </div>
</template>
