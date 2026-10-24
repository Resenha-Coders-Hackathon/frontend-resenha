<script setup lang="ts">
import { computed } from 'vue'
import type { ITasks } from '@/shared/types'
import { formatTaskDate, priorityLabels } from '../utils/kanban'

interface Props {
  task: ITasks
  disabled?: boolean
  dragging?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ open: [id: string]; drag: [id: string]; end: [] }>()
const initials = computed(
  () =>
    props.task.assignee_name
      ?.split(' ')
      .map((name) => name[0])
      .slice(0, 2)
      .join('') || '?',
)
function startDrag(event: DragEvent) {
  if (!event.dataTransfer || props.disabled) return
  event.dataTransfer.setData('application/x-kanban-task', props.task.id)
  event.dataTransfer.effectAllowed = 'move'
  emit('drag', props.task.id)
}
</script>

<template>
  <article
    class="kb-card"
    :class="{ 'is-dragging': dragging, 'is-complete': task.completed_at }"
    :draggable="!disabled"
    @dragstart="startDrag"
    @dragend="emit('end')"
  >
    <div class="flex items-center justify-between gap-2 text-[11px]">
      <span class="font-mono text-(--kanban-muted)">{{ task.id.slice(0, 8).toUpperCase() }}</span>
      <span class="flex items-center gap-1" :class="`kb-priority-${task.priority}`"
        ><span class="material-symbols-outlined text-[15px]!" aria-hidden="true"
          >signal_cellular_alt</span
        >{{ priorityLabels[task.priority] }}</span
      >
    </div>
    <button class="kb-card-title" :disabled="disabled" @click="emit('open', task.id)">
      {{ task.title }}
    </button>
    <p
      v-if="task.description"
      class="line-clamp-3 text-[12.5px] leading-[17px] text-(--kanban-secondary)"
    >
      {{ task.description }}
    </p>
    <div class="grid grid-cols-2 gap-1.5">
      <div class="kb-date">
        <span class="material-symbols-outlined" aria-hidden="true">calendar_today</span>
        <div>
          <span>Criada</span
          ><time :datetime="task.created_at">{{ formatTaskDate(task.created_at) }}</time>
        </div>
      </div>
      <div
        class="kb-date"
        :class="{
          'is-overdue': task.is_overdue,
          'has-deadline': task.due_date && !task.completed_at,
        }"
      >
        <span class="material-symbols-outlined" aria-hidden="true">{{
          task.is_overdue ? 'schedule' : 'flag'
        }}</span>
        <div>
          <span>{{ task.is_overdue ? 'Atrasada' : 'Entrega' }}</span
          ><time v-if="task.due_date" :datetime="task.due_date">{{
            formatTaskDate(task.due_date)
          }}</time>
          <p v-else>Sem prazo</p>
        </div>
      </div>
    </div>
    <footer
      class="flex items-center justify-between gap-2 border-t border-dashed border-(--kanban-border) pt-2.5"
    >
      <div class="flex min-w-0 items-center gap-1.5">
        <span class="kb-avatar" :title="task.assignee_name || 'Sem responsável'">{{
          initials
        }}</span
        ><span class="truncate text-[11px] text-(--kanban-muted)">{{
          task.assignee_name || 'Sem responsável'
        }}</span>
      </div>
      <button
        class="kb-icon"
        aria-label="Abrir detalhes e mudar status"
        :disabled="disabled"
        @click="emit('open', task.id)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">arrow_outward</span>
      </button>
    </footer>
  </article>
</template>
