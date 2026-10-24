<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IInputs } from '@/shared/types'

/* COMO USAR:
  const password = ref('')

  <PasswordInput v-model="password" label="Senha" icon="lock" />
*/

const props = withDefaults(defineProps<IInputs>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <div
    class="relative flex items-center rounded-2xl px-5 py-3 mt-5 shadow-inner transition-all duration-300 focus-within:ring-2 border border-(--border-default) dark:border-(--border-inverse)"
  >
    <span class="material-symbols-outlined mr-2 text-[20px] transition-colors duration-300">
      lock
    </span>

    <input
      v-model="value"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-autofill w-full text-sm outline-none placeholder:text-(--text-muted)"
    />

    <button
      type="button"
      :disabled="disabled"
      class="material-symbols-outlined ml-2"
      @click="showPassword = !showPassword"
    >
      {{ showPassword ? 'visibility_off' : 'visibility' }}
    </button>
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
