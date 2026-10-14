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
    :class="[
      'relative flex items-center rounded-2xl bg-(--surface-container-low) px-5 py-3 mt-5 shadow-inner transition-all duration-300 focus-within:bg-(--surface-bright) focus-within:ring-2 focus-within:ring-(--primary) dark:bg-(--surface-container-low-dark) dark:focus-within:bg-(--surface-container-dark)',
      {
        'cursor-not-allowed opacity-60': disabled,
      },
    ]"
  >
    <span class="material-symbols-outlined mr-2 text-[20px] text-(--outline)"> lock </span>

    <input
      v-model="value"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-autofill w-full border-0 bg-transparent text-sm outline-none text-(--on-surface) placeholder:text-(--outline) dark:text-(--on-surface-dark)"
    />

    <button
      type="button"
      :disabled="disabled"
      class="material-symbols-outlined ml-2 text-(--outline) transition-colors duration-300 hover:text-(--primary) active:text-(--primary)"
      @click="showPassword = !showPassword"
    >
      {{ showPassword ? 'visibility_off' : 'visibility' }}
    </button>
  </div>
</template>

<style scoped>
.input-autofill:-webkit-autofill,
.input-autofill:-webkit-autofill:hover,
.input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--on-surface);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-container-low) inset;
  box-shadow: 0 0 0 1000px var(--surface-container-low) inset;
  transition: background-color 9999s ease-out;
}

.dark .input-autofill:-webkit-autofill,
.dark .input-autofill:-webkit-autofill:hover,
.dark .input-autofill:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--on-surface-dark);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-container-low-dark) inset;
  box-shadow: 0 0 0 1000px var(--surface-container-low-dark) inset;
}
</style>
