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
}>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { display: false } },
    x: { grid: { display: false } },
  },
}
</script>

<template>
  <div
    class="min-w-0 py-3 px-5 border border-(--border-default) rounded-lg w-full bg-(--surface) dark:bg-(--surface-inverse) grid gap-2 shadow-xl dark:border-(--border-inverse)"
  >
    <h3 class="font-semibold text-sm">{{ title }}</h3>

    <div class="relative h-[220px] min-w-0 sm:h-[250px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
