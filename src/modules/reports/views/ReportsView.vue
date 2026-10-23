<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from '@/app/composables/useTheme'
import { BaseButton, CardComp, ChartComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { KPIS, LATE_BY_SECTOR, PEOPLE, PERIODS, WEEKLY_DONE } from '../utils/mocks'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: os números são de exemplo. O CSV é gerado no navegador.

const { isDark } = useTheme()
const period = ref(1)

// barras "tinta" acompanham o tema; a semana atual fica em laranja
const weeklyData = computed(() => ({
  labels: WEEKLY_DONE.labels,
  datasets: [
    {
      data: WEEKLY_DONE.values,
      backgroundColor: WEEKLY_DONE.values.map((_, index) =>
        index === WEEKLY_DONE.values.length - 1 ? '#f0541e' : isDark.value ? '#edece8' : '#141412',
      ),
    },
  ],
}))

const lateData = {
  labels: LATE_BY_SECTOR.map((sector) => sector.label),
  datasets: [
    {
      data: LATE_BY_SECTOR.map((sector) => sector.value),
      backgroundColor: LATE_BY_SECTOR.map((sector) => sector.color),
    },
  ],
}

const COLUMNS = ['Pessoa', 'Concluídas', 'No prazo', 'Abertas', 'Atrasadas']

function exportCsv() {
  const lines = [
    'pessoa;concluidas;no_prazo;abertas;atrasadas',
    ...PEOPLE.map((person) =>
      [person.name, person.done, `${person.onTime}%`, person.open, person.late].join(';'),
    ),
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: 'desempenho.csv' })
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Norte Studio', 'Relatórios']" has-notifications />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Relatórios"
        description="Outubro de 2026 · todos os setores"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            :label="PERIODS[period]"
            icon="calendar_today"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="period = (period + 1) % PERIODS.length"
          />
          <BaseButton
            variant="secondary"
            label="Exportar CSV"
            icon="download"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="exportCsv"
          />
        </div>
      </SubheaderComp>

      <div class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <CardComp
          v-for="kpi in KPIS"
          :key="kpi.title"
          :title="kpi.title"
          :data="kpi.data"
          :description="kpi.description"
        />
      </div>

      <div class="grid gap-[16px] lg:grid-cols-2">
        <ChartComp title="Concluídas por semana" :chart-data="weeklyData" />
        <ChartComp title="Atrasos por setor" :chart-data="lateData" />
      </div>

      <section
        class="overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <h2
          class="px-[18px] pt-[16px] pb-[12px] text-[15px]! leading-normal! font-semibold! tracking-normal!"
        >
          Desempenho por pessoa
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr
                class="border-y border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
              >
                <th
                  v-for="column in COLUMNS"
                  :key="column"
                  scope="col"
                  class="px-[18px] py-[9px] text-[12px] leading-normal font-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in PEOPLE"
                :key="person.id"
                class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
              >
                <td class="px-[18px] py-[12px]">
                  <span class="flex items-center gap-[8px] font-medium">
                    <span
                      class="grid size-[24px] shrink-0 place-items-center rounded-full text-[9px] leading-none font-semibold text-white"
                      :style="{ backgroundColor: avatar(person.name).color }"
                      aria-hidden="true"
                      >{{ avatar(person.name).initials }}</span
                    >
                    {{ person.name }}
                  </span>
                </td>
                <td class="px-[18px] py-[12px]">{{ person.done }}</td>
                <td class="px-[18px] py-[12px]">
                  <span :class="[BADGE_BASE, person.onTime >= 85 ? BADGE.success : BADGE.warning]"
                    >{{ person.onTime }}%</span
                  >
                </td>
                <td class="px-[18px] py-[12px]">{{ person.open }}</td>
                <td
                  :class="[
                    'px-[18px] py-[12px]',
                    person.late ? 'font-medium text-(--destructive)' : '',
                  ]"
                >
                  {{ person.late }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </div>
</template>
