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
  inputmode: undefined,
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
    class="relative flex items-center rounded-2xl px-5 py-3 mt-5 shadow-inner transition-all duration-300 focus-within:ring-2 border border-(--border-default)"
  >
    <span
      v-if="icon"
      class="material-symbols-outlined mr-2 text-[20px] transition-colors duration-300"
    >
      {{ icon }}
    </span>

    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-autofill w-full text-sm outline-none placeholder:text-(--text-muted)"
    />
  </div>
</template>

<style scoped>
.input-autofill:-webkit-autofill,
.input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--text-primary);
}

.dark .input-autofill:-webkit-autofill,
.dark .input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--text-inverse);
}
</style>
