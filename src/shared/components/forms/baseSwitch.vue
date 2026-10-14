<script setup lang="ts">
/* COMO USAR:
  const rememberMe = ref(false)

  <BaseSwitch v-model="rememberMe" label="Lembrar-me" description="Mantenha-me conectado" />
]*/

interface Props {
  modelValue: boolean
  label: string
  description?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label
    class="mt-5 flex cursor-pointer items-center justify-between rounded-2xl bg-(--surface-container-low) p-3 transition-colors duration-300 hover:bg-(--surface-container) active:bg-(--surface-container) dark:bg-(--surface-container-low-dark) dark:hover:bg-(--surface-container-dark) dark:active:bg-(--surface-container-dark)"
  >
    <div class="flex flex-col">
      <span class="text-sm text-(--on-surface) dark:text-(--on-surface-dark)">
        {{ label }}
      </span>

      <span
        v-if="description"
        class="text-xs text-(--on-surface-variant) dark:text-(--on-surface-variant-dark)"
      >
        {{ description }}
      </span>
    </div>

    <input type="checkbox" class="sr-only" :checked="modelValue" @change="toggle" />

    <div
      :class="[
        'relative h-7 w-13 rounded-full bg-(--surface-dim) p-0.5 transition-colors duration-300',
        {
          'bg-(--primary)': modelValue,
        },
      ]"
    >
      <div
        :class="[
          'h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          {
            'translate-x-6': modelValue,
          },
        ]"
      />
    </div>
  </label>
</template>
