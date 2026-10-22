<script setup lang="ts">
/* COMO USAR:
  const rememberMe = ref(false)

  <BaseSwitch v-model="rememberMe" label="Lembrar-me" description="Mantenha-me conectado" />
]*/

interface Props {
  modelValue: boolean
  label: string
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
  <label class="mt-5 flex w-fit items-center gap-2.5 text-sm cursor-pointer">
    <input type="checkbox" :checked="modelValue" @change="toggle" class="peer sr-only" />

    <span
      class="material-symbols-outlined flex text-(--text-inverse) dark:text-(--text-primary) items-center justify-center rounded-sm border border-(--border-strong) bg-(--surface) transition-all duration-200 peer-checked:border-(--surface-inverse) peer-checked:bg-(--surface-inverse) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:cursor-not-allowed dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:peer-checked:border-(--surface-inverse) dark:peer-checked:bg-(--surface)"
    >
      check
    </span>

    <span class="text-(--text-primary) dark:text-(--text-inverse)">
      {{ label }}
    </span>
  </label>
</template>
