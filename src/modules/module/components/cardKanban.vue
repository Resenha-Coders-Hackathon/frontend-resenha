<script setup lang="ts">
import type { ITasks } from '@/shared/types'
import type { Status } from '../types'

defineProps<{
  task: ITasks
  statuses: Status[]
}>()

defineEmits<{ move: [statusId: string]; calendar: [] }>()

const priorities = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' }
const date = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
</script>

<template>
  <div
    class="py-3 px-4 border border-(--border-default) rounded-lg w-full bg-(--surface) dark:bg-(--surface-inverse) grid gap-1 dark:border-(--border-inverse)"
  >
    <h4 class="font-semibold break-words">{{ task.title }}</h4>
    <p v-if="task.description" class="text-sm text-(--text-secondary) line-clamp-3">
      {{ task.description }}
    </p>
    <p class="text-xs text-(--text-muted)">
      {{ priorities[task.priority] }}<template v-if="task.due_date"> · entrega {{ date(task.due_date) }}</template>
      <span v-if="task.is_overdue" class="text-(--destructive)"> · atrasada</span>
    </p>
    <p v-if="task.assignee_name" class="text-xs">{{ task.assignee_name }}</p>
    <div class="mt-1 flex items-center gap-2">
      <select
        class="min-w-0 flex-1 rounded-md border border-(--border-default) bg-transparent px-2 py-1 text-xs dark:border-(--border-inverse)"
        :value="task.status_id"
        :aria-label="`Mover ${task.title}`"
        @change="$emit('move', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="status in statuses" :key="status.id" :value="status.id">
          {{ status.name }}
        </option>
      </select>
      <button
        type="button"
        class="material-symbols-outlined text-[20px] text-(--text-muted) hover:text-(--text-primary)"
        title="Adicionar ao Google Calendar"
        aria-label="Adicionar ao Google Calendar"
        @click="$emit('calendar')"
      >
        event
      </button>
    </div>
  </div>
</template>
