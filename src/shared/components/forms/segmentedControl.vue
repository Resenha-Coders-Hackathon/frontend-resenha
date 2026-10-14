<script setup lang="ts">
/* COMO USAR:
  const modelValue = ref('auto')
  const modes = [
    {
      value: 'auto',
      label: 'Auto',
    },
  ]

  <SegmentedControl v-model="modelValue" :options="modes" />
*/

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectOption = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="mt-5 relative flex rounded-2xl bg-(--surface-container-low) p-1.5 dark:bg-(--surface-container-low-dark)"
  >
    <div
      class="absolute inset-y-1.5 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-container) shadow-xs transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :style="{
        width: `${100 / options.length}%`,
        transform: `translateX(${
          options.findIndex((option) => option.value === props.modelValue) * 100
        }%)`,
      }"
    />

    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[
        'relative z-10 min-w-0 items-center justify-center text-sm sm:text-base flex-1 rounded-xl py-2 text-center transition-colors duration-300 cursor-pointer',
        modelValue === option.value
          ? 'font-bold text-white'
          : 'text-(--on-surface-variant) hover:text-(--on-surface) active:text-(--on-surface) dark:text-(--on-surface-variant-dark)',
      ]"
      @click="selectOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
