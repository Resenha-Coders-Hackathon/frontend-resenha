<script setup lang="ts">
import type { TaskPriority } from '@/shared/types'
import { priorityOf } from './priority'

const props = defineProps<{ priority: TaskPriority }>()
const p = priorityOf(props.priority)
</script>

<template>
  <span class="flex items-end gap-0.5" aria-hidden="true">
    <span
      v-for="n in 3"
      :key="n"
      class="w-0.75 rounded-[1px]"
      :style="{ height: `${3 + n * 3}px`, backgroundColor: n <= p.bars ? p.color : '#d3cfc8' }"
    />
  </span>
</template>
