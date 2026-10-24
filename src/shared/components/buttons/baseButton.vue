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
  iconPosition: 'right',
  loading: false,
  disabled: false,
  fullWidth: true,
  size: 'md',
  type: 'button',
})

const buttonClasses = computed(() => [
  // BASE
  'group inline-flex items-center justify-center gap-2 rounded-xl',
  'font-semibold transition-all duration-300 ease-out',

  // WIDTH
  props.fullWidth ? 'w-full' : 'w-fit',

  // SIZE
  props.size === 'sm' ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm',

  // VARIANTS
  {
    /* PRIMARY */
    'bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--text-inverse) dark:text-(--text-primary) hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]':
      props.variant === 'primary',

    /* SECONDARY */
    'dark:bg-(--surface-inverse) dark:text-(--text-inverse) bg-(--surface) text-(--text-primary) border border-(--border-default) dark:border-(--border-inverse) hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]':
      props.variant === 'secondary',

    /* GHOST */
    'bg-transparent text-(--text-primary) dark:text-(--text-inverse) hover:bg-(--bg-subtle) dark:hover:bg-(--bg-subtle)/20 active:scale-[0.98]':
      props.variant === 'ghost',

    /* DESTRUCTIVE */
    'bg-(--destructive) text-(--text-inverse) shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md active:translate-y-0 active:scale-[0.98]':
      props.variant === 'destructive',

    /* SUCCESS */
    'bg-(--sucess) text-(--text-inverse) shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md active:translate-y-0 active:scale-[0.98]':
      props.variant === 'success',

    /* DISABLED */
    'cursor-not-allowed opacity-50 shadow-none hover:translate-y-0 hover:shadow-none':
      props.disabled || props.loading,

    /* LOADING */
    'cursor-wait': props.loading,

    /* ENABLED */
    'cursor-pointer': !props.disabled && !props.loading,
  },
])
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="['mt-5 group', buttonClasses]">
    <span v-if="loading" class="material-symbols-outlined animate-spin text-[18px]">
      progress_activity
    </span>

    <span
      v-else-if="icon && iconPosition === 'left'"
      class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-all duration-300"
    >
      {{ icon }}
    </span>

    <span v-if="label">
      {{ label }}
    </span>

    <span
      v-if="!loading && icon && iconPosition === 'right'"
      class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-all duration-300"
    >
      {{ icon }}
    </span>
    <slot name="after" />
  </button>
</template>
