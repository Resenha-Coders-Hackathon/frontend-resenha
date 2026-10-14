<script setup lang="ts">
interface Props {
  icon: string
  label?: string
  variant?: 'default' | 'primary' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'default',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    type="button"
    :title="label"
    :aria-label="label"
    :disabled="disabled"
    :class="[
      'flex items-center justify-center rounded-full transition-all duration-300 mt-5',
      size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
      {
        'text-(--outline) hover:bg-(--surface-container-low) hover:text-(--on-surface) dark:hover:bg-(--surface-container-dark) dark:hover:text-white active:bg-(--surface-container-low) active:text-(--on-surface) dark:active:bg-(--surface-container-dark) dark:active:text-white':
          variant === 'default',

        'bg-(--primary-container) text-white shadow-md hover:scale-105 hover:shadow-lg active:scale-105 active:shadow-lg dark:bg-(--primary-container-dark)':
          variant === 'primary',

        'text-(--primary) hover:bg-(--surface-container-low) active:bg-(--surface-container-low) dark:text-(--primary-dark) dark:hover:bg-(--surface-container-dark) dark:active:bg-(--surface-container-dark)':
          variant === 'danger',

        'cursor-not-allowed opacity-50': disabled,
      },
    ]"
  >
    <span class="material-symbols-outlined" :class="size === 'sm' ? 'text-[16px]' : 'text-[20px]'">
      {{ icon }}
    </span>
  </button>
</template>
