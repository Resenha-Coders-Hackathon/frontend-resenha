<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../types'
import { avatar } from '@/shared/utils/people'
import { priorityOf, shortDate } from './priority'
import PriorityBars from './priorityBars.vue'

const props = defineProps<{ task: Task; draggable: boolean }>()
defineEmits<{ open: [] }>()

const priority = computed(() => priorityOf(props.task.priority))
const person = computed(() => (props.task.assignee_name ? avatar(props.task.assignee_name) : null))
const progress = computed(() =>
  props.task.checklist_total ? (props.task.checklist_done / props.task.checklist_total) * 100 : 0,
)
</script>

<template>
  <article
    :draggable="draggable"
    class="grid cursor-pointer gap-2 rounded-[12px] border border-(--border-default) bg-(--surface) p-3.5 text-left transition-colors hover:border-(--border-strong) focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-(--border-inverse) dark:bg-black/20"
    tabindex="0"
    role="button"
    :aria-label="`Abrir tarefa ${task.title}`"
    @click="$emit('open')"
    @keydown.enter.self="$emit('open')"
  >
    <div class="flex items-center gap-1.5 text-[12px] text-(--text-secondary)">
      <PriorityBars :priority="task.priority" />
      {{ priority.label }}
      <span v-if="task.completed_at" class="ml-auto flex items-center gap-1 text-[#127a3e]">
        <span class="material-symbols-outlined text-[15px]!" aria-hidden="true">check_circle</span>
        Concluída
      </span>
    </div>

    <h4 class="text-[14px] leading-5 font-semibold break-words">{{ task.title }}</h4>
    <p
      v-if="task.description"
      class="line-clamp-2 text-[12.5px] leading-[18px] text-(--text-muted)"
    >
      {{ task.description }}
    </p>

    <p
      v-if="task.due_date"
      :class="[
        'flex items-center gap-1 text-[12px]',
        task.is_overdue ? 'font-medium text-[#c42b2b]' : 'text-(--text-muted)',
      ]"
    >
      <span class="material-symbols-outlined text-[15px]!" aria-hidden="true">{{
        task.is_overdue ? 'schedule' : 'flag'
      }}</span>
      {{ task.is_overdue ? 'Atrasada' : 'Entrega' }} · {{ shortDate(task.due_date) }}
    </p>

    <div
      v-if="task.checklist_total"
      class="flex items-center gap-2 text-[12px] text-(--text-muted)"
    >
      <span class="h-1 flex-1 overflow-hidden rounded-full bg-(--bg-muted) dark:bg-white/10">
        <span
          class="block h-full bg-(--bg-orange) transition-[width] duration-700 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </span>
      {{ task.checklist_done }}/{{ task.checklist_total }}
    </div>

    <div class="flex items-center gap-3 text-[12px] text-(--text-muted)">
      <span
        v-if="person"
        class="flex items-center gap-1.5"
        :title="task.assignee_name ?? undefined"
      >
        <span
          class="grid size-5.5 place-items-center rounded-full text-[9.5px] font-semibold text-white"
          :style="{ backgroundColor: person.color }"
          aria-hidden="true"
          >{{ person.initials }}</span
        >
        <span class="max-w-28 truncate">{{ task.assignee_name }}</span>
      </span>
      <span v-else class="italic">Sem responsável</span>
      <span v-if="task.comment_count" class="ml-auto flex items-center gap-1">
        <span class="material-symbols-outlined text-[15px]!" aria-hidden="true">chat_bubble</span>
        {{ task.comment_count }}
      </span>
    </div>
  </article>
</template>
