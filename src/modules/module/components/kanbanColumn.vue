<script setup lang="ts">
import { ref } from 'vue'
import CardKanban from './cardKanban.vue'
import type { Status, Task } from '../types'

interface Props {
  status: Status
  tasks: Task[]
  total: number
  draggingId: string | null
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  open: [id: string]
  create: [statusId: string]
  edit: [status: Status]
  move: [taskId: string, statusId: string]
  drag: [id: string | null]
}>()
const over = ref(false)
function leave(event: DragEvent) {
  if (
    !(event.currentTarget instanceof HTMLElement) ||
    !(event.relatedTarget instanceof Node) ||
    !event.currentTarget.contains(event.relatedTarget)
  )
    over.value = false
}
function drop(event: DragEvent, statusId: string) {
  over.value = false
  const id = event.dataTransfer?.getData('application/x-kanban-task')
  if (id) emit('move', id, statusId)
  emit('drag', null)
}
</script>

<template>
  <section
    class="kb-column"
    :class="{ 'is-over': over && draggingId && !disabled }"
    :aria-label="status.name"
    @dragover.prevent="over = true"
    @dragleave="leave"
    @drop.prevent="!disabled && drop($event, status.id)"
  >
    <header class="flex items-center gap-2 px-1.5 pb-2">
      <span
        class="kb-status-dot"
        :style="{ '--status-color': status.color }"
        aria-hidden="true"
      ></span>
      <h2
        class="min-w-0 flex-1 truncate text-[13.5px]! leading-5! font-semibold"
        :title="status.name"
      >
        {{ status.name }}
      </h2>
      <span class="text-[11px] text-(--kanban-muted)"
        >{{ total }}<span v-if="status.wip_limit"> / {{ status.wip_limit }}</span></span
      >
      <button
        class="kb-icon"
        :disabled="disabled"
        :aria-label="`Adicionar tarefa em ${status.name}`"
        @click="emit('create', status.id)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">add</span>
      </button>
      <button
        class="kb-icon"
        :disabled="disabled"
        :aria-label="`Personalizar coluna ${status.name}`"
        @click="emit('edit', status)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">more_horiz</span>
      </button>
    </header>
    <div v-if="status.wip_limit" class="mb-2 h-[3px] overflow-hidden rounded bg-(--kanban-border)">
      <div
        class="h-full"
        :style="{
          backgroundColor: status.color,
          width: `${Math.min(100, (total / status.wip_limit) * 100)}%`,
        }"
      ></div>
    </div>
    <ul class="grid gap-2.5">
      <li v-for="task in tasks" :key="task.id">
        <CardKanban
          :task="task"
          :disabled="disabled"
          :dragging="draggingId === task.id"
          @open="emit('open', $event)"
          @drag="emit('drag', $event)"
          @end="emit('drag', null)"
        />
      </li>
    </ul>
    <p v-if="!tasks.length" class="px-3 py-8 text-center text-xs text-(--kanban-muted)">
      {{ total ? 'Nenhuma tarefa neste filtro.' : 'Arraste tarefas para cá ou crie a primeira.' }}
    </p>
    <button class="kb-add-task" :disabled="disabled" @click="emit('create', status.id)">
      <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">add</span>Adicionar
      tarefa
    </button>
  </section>
</template>
