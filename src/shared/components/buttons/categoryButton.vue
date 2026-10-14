<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 mt-5',
      active
        ? 'bg-(--primary-container) text-white shadow-sm dark:bg-(--primary-container-dark)'
        : 'text-(--on-surface-variant) hover:bg-(--surface-container-low) hover:text-(--on-surface) active:bg-(--surface-container-low) active:text-(--on-surface) dark:text-(--on-surface-variant-dark) dark:hover:bg-(--surface-container-dark) dark:hover:text-white dark:active:bg-(--surface-container-dark) dark:active:text-white',

      {
        'cursor-not-allowed opacity-50': disabled,
      },
    ]"
  >
    {{ label }}
  </button>
</template>
