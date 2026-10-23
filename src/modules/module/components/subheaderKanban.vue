<script setup lang="ts">
import { SubheaderComp, BaseButton } from '@/shared/components'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <SubheaderComp
    title="Nome do projeto"
    description="Setor de Marketing · campanha de lançamento do app"
  />

  <div class="flex justify-between">
    <div></div>
    <div class="flex gap-2">
      <BaseButton label="Compartilhar" icon="link_2" icon-position="left" variant="secondary" />
      <BaseButton label="Nova tarefa" icon="add" icon-position="left" />
    </div>
  </div>
</template>
