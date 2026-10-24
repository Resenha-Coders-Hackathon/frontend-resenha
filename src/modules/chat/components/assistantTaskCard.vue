<script setup lang="ts">
import { computed } from 'vue'
import type { AiTask } from '@/modules/ai'
import type { TaskPriority } from '@/shared/types'
import ChatAvatar from './chatAvatar.vue'

const props = defineProps<{ task: AiTask }>()

const due = computed(() =>
  props.task.due_date
    ? new Date(`${props.task.due_date}T12:00:00`).toLocaleDateString('pt-BR')
    : 'Sem prazo',
)

const PRIORITY: Record<TaskPriority, { label: string; bars: number; color: string }> = {
  low: { label: 'Baixa', bars: 1, color: 'text-[#2563eb] dark:text-[#8fb1ff]' },
  medium: { label: 'Média', bars: 2, color: 'text-[#d97706] dark:text-[#f5b14c]' },
  high: { label: 'Alta', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
  urgent: { label: 'Urgente', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
}
</script>

<template>
  <div
    class="flex min-w-0 items-start gap-[12px] rounded-[12px] border border-(--border-default) bg-(--surface) px-[12px] py-[12px] dark:border-(--border-inverse) dark:bg-black/20"
  >
    <span class="material-symbols-outlined text-[20px]! text-(--chat-ai)" aria-hidden="true"
      >task_alt</span
    >
    <div class="flex min-w-0 flex-1 flex-col gap-[6px] leading-normal">
      <p class="text-[13.5px] font-semibold">{{ task.title }}</p>
      <p
        class="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] text-(--text-muted)"
      >
        <span class="flex items-center gap-[6px]">
          <ChatAvatar :name="task.assignee_name ?? 'Sem responsável'" :size="18" />
          {{ task.assignee_name ?? 'Sem responsável' }}
        </span>
        <span aria-hidden="true">·</span>
        <span class="font-mono text-[11px]">{{ due }}</span>
        <span :class="['flex items-center gap-[4px] font-medium', PRIORITY[task.priority].color]">
          <span class="flex items-end gap-px" aria-hidden="true">
            <span
              v-for="bar in 3"
              :key="bar"
              :class="[
                'w-[3px] rounded-[1px] bg-current',
                bar > PRIORITY[task.priority].bars ? 'opacity-25' : '',
              ]"
              :style="{ height: `${4 + bar * 3}px` }"
            ></span>
          </span>
          {{ PRIORITY[task.priority].label }}
        </span>
        <span v-if="task.completed_at" class="text-(--chat-ai)">Concluída</span>
      </p>
      <p class="break-all font-mono text-[10px] text-(--text-muted)" :title="task.id">
        ID: {{ task.id }}
      </p>
    </div>
  </div>
</template>
