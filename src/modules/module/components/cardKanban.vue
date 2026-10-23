<script setup lang="ts">
import type { ITasks } from '@/shared/types'

defineProps<{
  task: ITasks
}>()
</script>

<template>
  <div
    class="py-3 px-5 border border-(--border-default) rounded-lg w-full bg-(--surface) dark:bg-(--surface-inverse) grid gap-1"
  >
    <div>
      <span>{{ task.id }}</span>
      <span>{{ task.priority }}</span>
    </div>

    <h4>{{ task.title }}</h4>
    <p>{{ task.description }}</p>

    <p>Criada {{ task.created_at }}</p>
    <p>Entrega {{ task.completed_at }}</p>

    <p>{{ task.assignee_name }}</p>
  </div>
</template>
