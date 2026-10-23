<script setup lang="ts">
import { SubheaderKanban, KanbanColumn } from '../components'
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full flex-col px-4 pt-10 sm:px-6 md:px-8 xl:px-10">
    <SubheaderKanban
      title="Nome do projeto"
      description="Setor de Marketing · campanha de lançamento do app"
    />

    <div class="flex gap-5 my-5">
      <KanbanColumn title="Backlog" :cards="['item', 'item']" />
      <KanbanColumn title="Backlog" :cards="['item', 'item']" />
      <KanbanColumn title="Backlog" :cards="['item', 'item']" />
    </div>
  </section>
</template>
