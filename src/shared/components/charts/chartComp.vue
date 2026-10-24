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
    class="py-3 pb-10 px-5 border border-(--border-default) rounded-lg w-full max-h-70 bg-(--surface) dark:bg-(--surface-inverse) grid gap-2 dark:border-(--border-inverse)"
  >
    <h3 class="font-semibold text-sm">{{ title }}</h3>

    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
