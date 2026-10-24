<script setup lang="ts">
import { SubheaderComp, BaseButton } from '@/shared/components'

defineProps<{
  title: string
  description: string
}>()

defineEmits<{ 'new-task': [] }>()
</script>

<template>
  <SubheaderComp :title="title" :description="description">
    <slot />
    <BaseButton label="Nova tarefa" icon="add" icon-position="left" @click="$emit('new-task')" />
  </SubheaderComp>
</template>
