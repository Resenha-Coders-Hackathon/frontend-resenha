<script setup lang="ts">
import type { TaskPriority } from '@/shared/types'
import type { AssistantTaskSuggestion } from '../types'
import ChatAvatar from './chatAvatar.vue'

defineProps<{ task: AssistantTaskSuggestion }>()

const selected = defineModel<boolean>('selected', { required: true })

const PRIORITY: Record<TaskPriority, { label: string; bars: number; color: string }> = {
  low: { label: 'Baixa', bars: 1, color: 'text-[#2563eb] dark:text-[#8fb1ff]' },
  medium: { label: 'Média', bars: 2, color: 'text-[#d97706] dark:text-[#f5b14c]' },
  high: { label: 'Alta', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
  urgent: { label: 'Urgente', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
}
</script>

<template>
  <div
    :class="[
      'flex items-start gap-[12px] rounded-[12px] border bg-(--surface) px-[12px] py-[12px] transition-colors dark:bg-black/20',
      selected
        ? 'border-(--chat-ai)/35'
        : 'border-(--border-default) dark:border-(--border-inverse)',
    ]"
  >
    <input
      v-model="selected"
      type="checkbox"
      class="mt-[2px] size-[17px] shrink-0 cursor-pointer accent-(--chat-ai)"
      :aria-label="`Incluir “${task.title}”`"
    />

    <div class="flex min-w-0 flex-1 flex-col gap-[6px] leading-normal">
      <p class="text-[13.5px] font-semibold">{{ task.title }}</p>
      <p
        class="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] text-(--text-muted)"
      >
        <span class="flex items-center gap-[6px]">
          <ChatAvatar
            :name="task.assignee"
            :size="18"
            :variant="task.assignee === 'Paulo Artur' ? 'self' : 'default'"
          />
          {{ task.assignee }}
        </span>
        <span aria-hidden="true">·</span>
        <span class="font-mono text-[11px]">Entrega {{ task.due }}</span>
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
        <span
          v-if="task.integration"
          class="flex items-center gap-[4px] rounded-[6px] border border-(--border-default) px-[6px] py-px text-(--text-secondary) dark:border-(--border-inverse) dark:text-(--text-inverse-muted)"
        >
          <span class="material-symbols-outlined text-[13px]!" aria-hidden="true">{{
            task.integration.icon
          }}</span>
          {{ task.integration.label }}
        </span>
      </p>
    </div>

    <button
      type="button"
      class="grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-[7px] text-(--text-muted) transition-colors hover:bg-(--bg-subtle) dark:hover:bg-white/10"
      :aria-label="`Mais opções para “${task.title}”`"
    >
      <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">more_horiz</span>
    </button>
  </div>
</template>
