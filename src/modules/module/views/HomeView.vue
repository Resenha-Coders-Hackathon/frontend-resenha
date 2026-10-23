<script setup lang="ts">
import { computed } from 'vue'
import {
  SubheaderComp,
  BaseButton,
  CardComp,
  PendingTasksTable,
  UserTable,
  ChartComp,
} from '@/shared/components'
import type { ICards } from '@/shared/types'
import { useAuthStore } from '@/modules/auth/stores'

const authStore = useAuthStore()

const cards: ICards[] = [
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

const chartData = computed(() => {
  const last7DaysObjects = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d
  }).reverse()

  const dynamicLabels = last7DaysObjects.map((date) =>
    date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
  )

  return {
    labels: dynamicLabels,
    datasets: [
      {
        label: 'Tarefas concluídas',
        backgroundColor: '#ff6700',
        borderRadius: 6,
        data: [5, 8, 4, 2, 10, 1, 8],
      },
    ],
  }
})
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full flex-col px-4 pt-10 sm:px-6 md:px-8 xl:px-10">
    <SubheaderComp
      :title="`Bom dia, ${authStore.user?.name}`"
      description="Sexta, 23 de outubro · você tem 6 tarefas abertas"
    >
      <RouterLink to="/organizacoes" class="text-sm underline">Organizações</RouterLink>
      <BaseButton label="Nova tarefa" icon="add" icon-position="left" />
    </SubheaderComp>

    <div class="flex gap-5 mb-5">
      <CardComp
        v-for="(card, index) in cards"
        :key="index"
        :title="card.title"
        :data="card.data"
        :description="card.description"
      />
    </div>

    <div class="flex gap-5 mb-5">
      <PendingTasksTable title="Para hoje" />
      <UserTable title="Atividade recente" />
    </div>

    <div class="flex gap-5">
      <ChartComp title="Tarefas concluídas por semana" :chartData="chartData" />
      <ChartComp title="Abertas por setor" :chartData="chartData" />
    </div>
  </section>
</template>
