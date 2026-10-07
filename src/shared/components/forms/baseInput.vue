<script setup lang="ts">
import { computed } from 'vue'
import type { IInputs } from '@/shared/types'

/* COMO USAR:
  const email = ref('')

  <BaseInput v-model="email" label="E-mail" type="email" icon="alternate_email" />
*/

const props = withDefaults(defineProps<IInputs>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  icon: '',
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <div
    class="relative flex items-center rounded-2xl bg-(--surface-container-low) px-5 py-3 mt-5 shadow-inner transition-all duration-300 focus-within:bg-(--surface-bright) focus-within:ring-2 focus-within:ring-(--primary) dark:bg-(--surface-container-low-dark) dark:focus-within:bg-(--surface-container-dark)"
  >
    <span
      v-if="icon"
      class="material-symbols-outlined mr-2 text-[20px] text-(--outline) transition-colors duration-300 group-focus-within:text-(--primary)"
    >
      {{ icon }}
    </span>

    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-autofill w-full border-0 text-sm bg-transparent outline-none text-(--on-surface) placeholder:text-(--outline) dark:text-(--on-surface-dark)"
    />
  </div>
</template>

<style scoped>
.input-autofill:-webkit-autofill,
.input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--on-surface);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-container-low) inset;
  box-shadow: 0 0 0 1000px var(--surface-container-low) inset;
  transition: background-color 9999s ease-out;
}

.dark .input-autofill:-webkit-autofill,
.dark .input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--on-surface-dark);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-container-low-dark) inset;
  box-shadow: 0 0 0 1000px var(--surface-container-low-dark) inset;
}
</style>
