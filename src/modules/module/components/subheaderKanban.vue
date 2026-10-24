<script setup lang="ts">
import { BaseButton } from '@/shared/components'
interface Props {
  title: string
  description: string
  progress: number
  total: number
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ create: []; column: []; share: [] }>()
</script>
<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="text-[26px]! leading-9! tracking-tight">{{ title }}</h1>
      <p class="mt-1 text-sm text-(--kanban-secondary)">{{ description }}</p>
      <p class="mt-2 text-xs text-(--kanban-muted)">
        {{ total }} tarefas <span class="mx-2">·</span> {{ progress }}% concluído
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <BaseButton
        class="mt-0!"
        label="Compartilhar"
        icon="link"
        icon-position="left"
        variant="secondary"
        :full-width="false"
        size="sm"
        :disabled="disabled"
        @click="emit('share')"
      /><BaseButton
        class="mt-0!"
        label="Nova coluna"
        icon="view_column_2"
        icon-position="left"
        variant="secondary"
        :full-width="false"
        size="sm"
        :disabled="disabled"
        @click="emit('column')"
      /><BaseButton
        class="mt-0!"
        label="Nova tarefa"
        icon="add"
        icon-position="left"
        :full-width="false"
        size="sm"
        :disabled="disabled"
        @click="emit('create')"
      />
    </div>
  </header>
</template>
