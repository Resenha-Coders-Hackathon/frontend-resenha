<script setup lang="ts">
import { CardKanban } from '.'
import type { ITasks } from '@/shared/types'
import type { Status } from '../types'

defineProps<{
  status: Status
  tasks: ITasks[]
  statuses: Status[]
}>()

defineEmits<{ add: []; move: [taskId: string, statusId: string]; calendar: [taskId: string] }>()
</script>

<template>
  <div
    class="flex max-h-[calc(100dvh-16rem)] min-w-72 flex-1 flex-col rounded-xl bg-(--surface) dark:bg-(--surface-inverse)"
  >
    <div
      class="flex min-h-0 flex-1 flex-col border-b border-(--border-default) py-3 px-4 dark:border-(--border-inverse)"
    >
      <div class="flex justify-between">
        <h3 class="flex gap-1 text-sm">
          <span class="material-symbols-outlined">history</span>
          <span class="font-semibold">{{ status.name }}</span>

          <span class="text-xs text-(--text-muted)">
            {{ tasks.length }}
          </span>
        </h3>

        <div class="text-(--text-muted)">
          <button
            type="button"
            class="material-symbols-outlined"
            :aria-label="`Nova tarefa em ${status.name}`"
            @click="$emit('add')"
          >
            add
          </button>
        </div>
      </div>

      <ul class="grid min-h-0 flex-1 gap-3 overflow-y-auto py-3">
        <li v-for="task in tasks" :key="task.id">
          <CardKanban
            :task="task"
            :statuses="statuses"
            @move="(statusId) => $emit('move', task.id, statusId)"
            @calendar="$emit('calendar', task.id)"
          />
        </li>
      </ul>

      <p v-if="tasks.some((t) => t.is_overdue)" class="shrink-0 pt-2 text-sm">
        Existem itens atrasados
      </p>
    </div>
  </div>
</template>
