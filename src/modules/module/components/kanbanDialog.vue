<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
interface Props {
  title: string
  drawer?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
onMounted(() => dialog.value?.showModal())
function outside(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const rect = dialog.value.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    emit('close')
}
</script>
<template>
  <dialog
    ref="dialog"
    class="kb-dialog"
    :class="{ 'kb-drawer': drawer }"
    aria-labelledby="kanban-dialog-title"
    @cancel.prevent="emit('close')"
    @click="outside"
  >
    <header
      class="flex items-center justify-between gap-3 border-b border-(--kanban-border) px-5 py-3"
    >
      <h2 id="kanban-dialog-title" class="text-sm! leading-6! font-medium">{{ title }}</h2>
      <button class="kb-icon" aria-label="Fechar" @click="emit('close')">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </header>
    <div class="p-5 sm:p-6"><slot /></div>
  </dialog>
</template>
