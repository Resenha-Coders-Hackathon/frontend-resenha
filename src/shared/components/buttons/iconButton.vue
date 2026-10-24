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
      'group flex items-center justify-center rounded-full transition-all duration-300 ease-out mt-5',
      size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
      {
        'text-(--outline) hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) dark:hover:bg-(--bg-orange)/10 active:bg-(--bg-orange)/10':
          variant === 'default',

        'bg-(--bg-orange) text-white shadow-md hover:brightness-105 dark:bg-(--bg-orange)':
          variant === 'primary',

        'text-(--primary) hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) dark:text-(--primary-dark) dark:hover:bg-(--bg-orange)/10':
          variant === 'danger',

        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]': !disabled,
        'cursor-not-allowed opacity-50': disabled,
      },
    ]"
  >
    <span
      class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-0.5"
      :class="size === 'sm' ? 'text-[16px]' : 'text-[20px]'"
    >
      {{ icon }}
    </span>
  </button>
</template>
