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
  <label class="mt-5 flex w-fit cursor-pointer items-center gap-2 text-[13px]">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="toggle"
      class="size-3.5 cursor-pointer accent-(--accent-orange) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-orange)"
    />

    <span class="text-(--text-primary) dark:text-(--text-inverse)">
      {{ label }}
    </span>
  </label>
</template>
