<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData } from 'chart.js'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

defineProps<{
  chartData: ChartData<'bar'>
  title: string
  /** Número em destaque abaixo do título, como "47". */
  headline?: string
  /** Texto pequeno ao lado do destaque, como "+12%". */
  note?: string
  /** Mensagem no lugar do gráfico quando não há barras. */
  empty?: string
}>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  datasets: { bar: { borderRadius: 6, maxBarThickness: 88 } },
  scales: {
    // contagens são inteiras: sem eixo, o valor aparece ao passar o mouse
    y: { display: false, beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } },
    x: { grid: { display: false }, border: { display: false } },
  },
}
</script>

<template>
  <div
    class="group relative grid min-w-0 w-full gap-2 overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] py-[16px] transition-all duration-300 before:absolute before:top-0 before:left-[18px] before:h-[2px] before:w-6 before:rounded-full before:bg-(--bg-orange)/55 before:transition-all before:duration-300 hover:border-(--bg-orange)/50 hover:shadow-[0_8px_24px_rgba(255,103,0,0.1)] hover:before:w-12 hover:before:bg-(--bg-orange) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <h3 class="text-[15px] font-semibold">{{ title }}</h3>
    <p v-if="headline" class="flex items-baseline gap-2">
      <span class="text-[28px] leading-none font-semibold tracking-[-0.02em]">{{ headline }}</span>
      <span v-if="note" class="text-[13px] text-(--text-muted)">{{ note }}</span>
    </p>

    <p v-if="empty && !chartData.labels?.length" class="py-[24px] text-[13px] text-(--text-muted)">
      {{ empty }}
    </p>
    <div v-else class="relative h-[200px] min-w-0">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
