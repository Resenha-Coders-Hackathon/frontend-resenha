<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success'
  label?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  label: '',
  icon: '',
  iconPosition: 'left',
  loading: false,
  disabled: false,
  fullWidth: true,
  size: 'md',
  type: 'button',
})

const buttonClasses = computed(() => [
  'flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300',

  props.fullWidth ? 'w-full' : 'w-fit',

  props.size === 'sm' ? 'px-4 py-2 text-xs' : 'px-5 py-3 text-sm',

  {
    /* PRIMARY */
    'bg-(--primary-container) text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg dark:bg-(--primary-container-dark)':
      props.variant === 'primary',

    /* SECONDARY */
    'bg-(--secondary-color) text-white hover:-translate-y-0.5 hover:shadow-md':
      props.variant === 'secondary',

    /* GHOST */
    'bg-transparent text-(--on-surface) hover:bg-(--surface-container-low) dark:text-white dark:hover:bg-(--surface-container-dark)':
      props.variant === 'ghost',

    /* DESTRUCTIVE */
    'bg-(--primary) text-white hover:bg-(--primary-container)': props.variant === 'destructive',

    /* SUCCESS */
    'bg-(--tertiary-color) text-white hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md':
      props.variant === 'success',

    /* DISABLED */
    'cursor-not-allowed opacity-50': props.disabled || props.loading,

    /* LOADING */
    'cursor-wait': props.loading,
  },
])
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="['mt-5', buttonClasses]">
    <span v-if="loading" class="material-symbols-outlined animate-spin text-[18px]">
      progress_activity
    </span>

    <span v-else-if="icon && iconPosition === 'left'" class="material-symbols-outlined text-[18px]">
      {{ icon }}
    </span>

    <span v-if="label">
      {{ label }}
    </span>

    <span
      v-if="!loading && icon && iconPosition === 'right'"
      class="material-symbols-outlined text-[18px]"
    >
      {{ icon }}
    </span>
  </button>
</template>
