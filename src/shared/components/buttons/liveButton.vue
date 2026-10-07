<script setup lang="ts">
interface Props {
  label?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: 'Listen Event Stream',
  disabled: false,
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-(--surface-container-low) px-5 py-3 text-sm font-semibold text-(--on-surface) transition-all duration-300 hover:bg-(--surface-container-high) dark:bg-(--surface-container-dark) dark:text-white',
      {
        'cursor-not-allowed opacity-50': disabled,
      },
    ]"
  >
    <span class="relative flex h-3 w-3">
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--tertiary-color) opacity-75"
      />

      <span class="relative inline-flex h-3 w-3 rounded-full bg-(--tertiary-color)" />
    </span>

    <span>
      {{ label }}
    </span>
  </button>
</template>
