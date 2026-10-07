<script setup lang="ts">
/* COMO USAR:
  const rememberMe = ref(false)

  <PillCheckbox v-model="rememberMe" label="Lembrar-me" icon="check_circle" />
*/

interface Props {
  modelValue: boolean
  label: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'check_circle',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label
    :class="[
      'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs mt-5 transition-all duration-300 active:scale-95',
      modelValue
        ? 'bg-(--primary-fixed) text-(--on-primary-fixed) dark:bg-(--primary-container) dark:text-white'
        : 'bg-(--surface-container-high) text-(--on-surface-variant) hover:bg-(--surface-container) dark:bg-(--surface-container-high-dark) dark:text-(--on-surface-variant-dark)',
    ]"
  >
    <input type="checkbox" class="sr-only" :checked="modelValue" @change="toggle" />

    <span class="material-symbols-outlined text-[16px]">
      {{ modelValue ? icon : 'radio_button_unchecked' }}
    </span>

    {{ label }}
  </label>
</template>
