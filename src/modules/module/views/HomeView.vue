<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton, CardComp, PendingTasksTable, UserTable, ChartComp } from '@/shared/components'
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
  <section
    class="mx-auto flex min-h-dvh w-full min-w-0 max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-8 xl:px-10"
  >
    <header class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-2xl! leading-tight! break-words sm:text-3xl!">
          Bom dia, {{ authStore.user?.name }}
        </h1>
        <p class="mt-2 text-sm text-(--text-muted)">
          Sexta, 23 de outubro · você tem 6 tarefas abertas
        </p>
      </div>
      <BaseButton
        label="Nova tarefa"
        icon="add"
        icon-position="left"
        class="mt-0! shrink-0 sm:w-auto"
      />
    </header>

    <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <CardComp
        v-for="(card, index) in cards"
        :key="index"
        :title="card.title"
        :data="card.data"
        :description="card.description"
        class="min-w-0 max-w-none! break-words"
      />
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
      <PendingTasksTable title="Para hoje" class="min-w-0 break-words" />
      <UserTable title="Atividade recente" class="min-w-0 break-words" />
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
      <ChartComp title="Tarefas concluídas por semana" :chartData="chartData" />
      <ChartComp title="Abertas por setor" :chartData="chartData" />
    </div>
  </section>
</template>
