<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Status, Task } from '../types'
import BoardCard from './boardCard.vue'

const props = defineProps<{ status: Status; tasks: Task[]; canEdit: boolean }>()
const emit = defineEmits<{
  add: []
  open: [taskId: string]
  drop: [taskId: string, position: number]
}>()

const ICONS = { todo: 'circle', in_progress: 'timelapse', done: 'check_circle' } as const
const over = ref(false)
const full = computed(
  () => !!props.status.wip_limit && props.tasks.length >= props.status.wip_limit,
)

function dragStart(event: DragEvent, task: Task) {
  event.dataTransfer?.setData('text/plain', task.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function drop(event: DragEvent, position = props.tasks.length) {
  over.value = false
  const id = event.dataTransfer?.getData('text/plain')
  if (id && props.canEdit) emit('drop', id, position)
}
</script>

<template>
  <section
    :aria-label="status.name"
    :class="[
      'flex min-w-64 max-w-[30rem] flex-1 basis-0 flex-col rounded-[14px] bg-(--bg-subtle) transition-colors dark:bg-white/5',
      over ? 'outline-2 -outline-offset-2 outline-(--bg-orange)' : '',
    ]"
    @dragover.prevent="over = canEdit"
    @dragleave.self="over = false"
    @drop.prevent="drop($event)"
  >
    <header class="flex items-center gap-2 px-3.5 pt-3 pb-2">
      <span
        class="material-symbols-outlined text-[18px]!"
        :style="{ color: status.color || undefined }"
        aria-hidden="true"
        >{{ ICONS[status.category] }}</span
      >
      <h3 class="text-[13.5px] font-semibold">{{ status.name }}</h3>
      <span :class="['text-[12px]', full ? 'font-semibold text-[#c42b2b]' : 'text-(--text-muted)']">
        {{ tasks.length }}<template v-if="status.wip_limit"> / {{ status.wip_limit }}</template>
      </span>
      <button
        v-if="canEdit"
        type="button"
        class="material-symbols-outlined ml-auto grid size-7 place-items-center rounded-lg text-[18px]! text-(--text-muted) hover:bg-(--bg-muted) dark:hover:bg-white/10"
        :aria-label="`Nova tarefa em ${status.name}`"
        @click="emit('add')"
      >
        add
      </button>
    </header>

    <ul class="grid min-h-12 flex-1 content-start gap-2.5 overflow-y-auto px-2.5 pb-2.5">
      <li
        v-for="(task, index) in tasks"
        :key="task.id"
        @dragstart="dragStart($event, task)"
        @dragover.prevent.stop="over = canEdit"
        @drop.prevent.stop="drop($event, index)"
      >
        <BoardCard :task="task" :draggable="canEdit" @open="emit('open', task.id)" />
      </li>
      <li v-if="!tasks.length" class="px-1 py-3 text-center text-[12.5px] text-(--text-muted)">
        {{ canEdit ? 'Solte uma tarefa aqui ou crie a primeira.' : 'Sem tarefas.' }}
      </li>
    </ul>
  </section>
</template>
