<script setup lang="ts">
import { ref } from 'vue'

const userType = ref('client')

const userTypes = [
  {
    value: 'client',
    label: 'Portal do Cliente / Embarcador',
  },
  {
    value: 'operator',
    label: 'Operador / Transportador',
  },
]
</script>

<template>
  <div
    class="mt-8 flex justify-center rounded-full bg-(--surface-container-low) p-1.5 text-sm font-semibold dark:bg-(--surface-container-low-dark)"
  >
    <label
      v-for="type in userTypes"
      :key="type.value"
      :class="[
        userType === type.value
          ? 'bg-white text-(--primary) shadow-sm dark:bg-linear-to-r dark:to-(--primary) dark:from-(--primary-container) dark:text-white'
          : 'text-(--neutral-color) hover:text-(--primary) dark:text-(--on-surface-variant-dark) dark:hover:text-white',
        'cursor-pointer rounded-full w-full mx-6 py-3 transition-all duration-300 text-center',
      ]"
    >
      <input v-model="userType" type="radio" name="userType" :value="type.value" class="sr-only" />

      {{ type.label }}
    </label>
  </div>
</template>
