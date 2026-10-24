<script setup lang="ts">
withDefaults(
  defineProps<{
    placeholder: string
    submitLabel: string
    submitIcon: string
    // "ai" usa o roxo do assistente na borda e no botão
    accent?: 'ink' | 'ai'
  }>(),
  { accent: 'ink' },
)

const emit = defineEmits<{ submit: [] }>()

const model = defineModel<string>({ default: '' })

// Enter envia; Shift+Enter quebra a linha
function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return
  event.preventDefault()
  emit('submit')
}
</script>

<template>
  <form
    :class="[
      'flex flex-col gap-[10px] rounded-[12px] border bg-(--surface) px-[12px] pt-[12px] pb-[10px] transition-[border-color,box-shadow] dark:bg-black/20',
      accent === 'ai'
        ? 'border-(--chat-ai)/40 focus-within:border-(--chat-ai)'
        : 'border-(--border-default) focus-within:border-(--border-strong) dark:border-(--border-inverse) dark:focus-within:border-(--text-inverse-muted)',
    ]"
    @submit.prevent="emit('submit')"
  >
    <label class="sr-only" :for="`composer-${submitLabel}`">{{ placeholder }}</label>
    <textarea
      :id="`composer-${submitLabel}`"
      v-model="model"
      rows="1"
      :placeholder="placeholder"
      class="max-h-[120px] min-h-[24px] resize-none bg-transparent text-[13.5px] leading-[20px] outline-none placeholder:text-(--text-muted) field-sizing-content"
      @keydown="handleKeydown"
    ></textarea>

    <div class="flex items-center gap-[6px]">
      <slot name="tools" />
      <button
        type="submit"
        :class="[
          'ml-auto flex h-[32px] cursor-pointer items-center gap-[6px] rounded-[8px] px-[12px] text-[13px] font-medium text-white transition-opacity hover:opacity-90',
          accent === 'ai'
            ? 'bg-(--chat-ai)'
            : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
        ]"
      >
        <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">{{
          submitIcon
        }}</span>
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>
