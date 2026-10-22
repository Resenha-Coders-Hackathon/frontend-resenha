<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ length?: number; disabled?: boolean }>(), {
  length: 6,
  disabled: false,
})

const model = defineModel<string>({ default: '' })
const cells = ref<string[]>(Array.from({ length: props.length }, () => ''))
const inputs = ref<HTMLInputElement[]>([])

watch(
  model,
  (value) => {
    if (value === cells.value.join('')) return
    cells.value = Array.from({ length: props.length }, (_, index) => value[index] ?? '')
  },
  { immediate: true },
)

function sync() {
  model.value = cells.value.join('')
}

function focusCell(index: number) {
  const input = inputs.value[Math.max(0, Math.min(index, props.length - 1))]
  input?.focus()
  input?.select()
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  let digits = target.value.replace(/\D/g, '')

  if (digits.length === 2 && digits[0] === cells.value[index]) digits = digits.slice(1)

  if (!digits) {
    cells.value[index] = ''
    target.value = ''
    sync()
    return
  }

  let cursor = index
  for (const digit of digits) {
    if (cursor >= props.length) break
    cells.value[cursor++] = digit
  }
  target.value = cells.value[index] ?? ''
  sync()
  focusCell(cursor)
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !cells.value[index] && index > 0) {
    event.preventDefault()
    cells.value[index - 1] = ''
    sync()
    focusCell(index - 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusCell(index - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusCell(index + 1)
  }
}

onMounted(() => focusCell(cells.value.findIndex((cell) => !cell)))
</script>

<template>
  <div class="flex justify-between gap-[10px]" role="group" aria-label="Código de verificação">
    <input
      v-for="(cell, index) in cells"
      :key="index"
      ref="inputs"
      :value="cell"
      type="text"
      inputmode="numeric"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :aria-label="`Dígito ${index + 1}`"
      :disabled="disabled"
      class="h-[60px] w-full max-w-[52px] rounded-[8px] border border-(--border-default) bg-(--surface) text-center text-[24px] font-semibold text-(--text-primary) outline-none transition-colors focus:border-2 focus:border-(--border-strong) disabled:opacity-60 dark:border-(--border-inverse) dark:bg-black/30 dark:text-(--text-inverse) dark:focus:border-(--text-inverse)"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>
