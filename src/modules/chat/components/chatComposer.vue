<script setup lang="ts">
defineProps<{
  placeholder: string
  submitLabel: string
  submitIcon: string
}>()

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
      'border-(--border-default) focus-within:border-(--bg-orange) focus-within:shadow-[0_0_0_3px_rgb(255_103_0/0.12)] dark:border-(--border-inverse)',
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
          'ml-auto flex h-[32px] cursor-pointer items-center gap-[6px] rounded-[8px] px-[12px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_4px_12px_rgba(255,103,0,0.24)] active:translate-y-0 active:scale-[0.98]',
          'bg-(--bg-orange)',
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
