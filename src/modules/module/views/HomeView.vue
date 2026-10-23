<script setup lang="ts">
import { SubheaderComp, BaseButton, CardComp, PendingTasksTable } from '@/shared/components'

const cards = [
  {
    title: 'Minhas tarefas abertas',
    data: '6',
    description: '2 vencem esta semana',
  },
  {
    title: 'Concluídas na semana',
    data: '9',
    description: '+3 em relação à anterior',
  },
  {
    title: 'Atrasadas',
    data: '1',
    description: 'Kit de identidade social',
  },
  {
    title: 'Créditos de IA',
    data: '312/500',
    description: 'Renova em 01/11',
  },
]
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full flex-col px-4 pt-10 sm:px-6 md:px-8 xl:px-10">
    <SubheaderComp
      title="Bom dia, Nicole"
      description="Sexta, 23 de outubro · você tem 6 tarefas abertas"
    >
      <BaseButton label="Nova tarefa" icon="add" icon-position="left" />
    </SubheaderComp>

    <div class="flex gap-5">
      <CardComp
        v-for="(card, index) in cards"
        :key="index"
        :title="card.title"
        :data="card.data"
        :description="card.description"
      />
    </div>

    <div>
      <PendingTasksTable title="Para hoje" />
    </div>
  </section>
</template>
