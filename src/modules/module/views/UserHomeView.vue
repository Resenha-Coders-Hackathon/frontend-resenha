<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, CardComp, ChartComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'
import { ACTIVITY, HOME_KPIS, OPEN_BY_SECTOR, TODAY, WEEKLY_DONE } from '../utils/userHome'

// Página só de interface: listas e números são de exemplo, sem backend.

const router = useRouter()
const auth = useAuthStore()

// mesmo formato dos gráficos da Home (/): laranja da marca e cantos arredondados
const CHART_STYLE = { backgroundColor: '#ff6700', borderRadius: 6 }

const greeting = computed(() => {
  const hour = new Date().getHours()
  const salute = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = auth.user?.name?.trim().split(/\s+/)[0]
  return firstName ? `${salute}, ${firstName}` : salute
})

const today = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const description = `${today.charAt(0).toUpperCase()}${today.slice(1)} · você tem ${HOME_KPIS[0]!.data} tarefas abertas`

const weeklyData = {
  labels: WEEKLY_DONE.labels,
  datasets: [{ label: 'Tarefas concluídas', ...CHART_STYLE, data: WEEKLY_DONE.values }],
}

const sectorData = {
  labels: OPEN_BY_SECTOR.labels,
  datasets: [{ label: 'Tarefas abertas', ...CHART_STYLE, data: OPEN_BY_SECTOR.values }],
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Norte Studio', 'Início']" has-notifications />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp :title="greeting" :description="description" class="mb-0!">
        <BaseButton
          label="Nova tarefa"
          icon="add"
          icon-position="left"
          :full-width="false"
          :class="TOOLBAR_BUTTON"
          @click="router.push({ name: 'Mural' })"
        />
      </SubheaderComp>

      <div class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <CardComp
          v-for="kpi in HOME_KPIS"
          :key="kpi.title"
          :title="kpi.title"
          :data="kpi.data"
          :description="kpi.description"
        />
      </div>

      <div class="grid items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <section
          class="flex flex-col rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] pt-[16px] pb-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <header class="flex items-center justify-between pb-[4px]">
            <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">Para hoje</h2>
            <RouterLink
              :to="{ name: 'MyTasks' }"
              class="text-[13px] font-medium text-(--bg-orange) hover:underline"
            >
              Ver todas
            </RouterLink>
          </header>
          <ul class="flex flex-col">
            <li
              v-for="item in TODAY"
              :key="item.id"
              class="flex items-center gap-[12px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            >
              <span
                class="grid size-[32px] shrink-0 place-items-center rounded-[9px] bg-(--bg-muted) dark:bg-black/30"
                aria-hidden="true"
              >
                <span
                  class="material-symbols-outlined text-[17px]! text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >{{ item.icon }}</span
                >
              </span>
              <span class="flex min-w-0 flex-1 flex-col leading-normal">
                <span class="truncate text-[13.5px] font-medium">{{ item.title }}</span>
                <span class="text-[12px] text-(--text-muted)">{{ item.meta }}</span>
              </span>
              <span :class="[BADGE_BASE, BADGE[item.tone]]">{{ item.badge }}</span>
            </li>
          </ul>
        </section>

        <section
          class="flex flex-col rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] pt-[16px] pb-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <h2 class="pb-[4px] text-[15px]! leading-normal! font-semibold! tracking-normal!">
            Atividade recente
          </h2>
          <ul class="flex flex-col">
            <li
              v-for="item in ACTIVITY"
              :key="item.id"
              class="flex items-center gap-[12px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            >
              <span
                :class="[
                  'grid size-[32px] shrink-0 place-items-center rounded-full text-[11px] leading-none font-semibold text-white',
                  avatar(item.person).color
                    ? ''
                    : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                ]"
                :style="{ backgroundColor: avatar(item.person).color || undefined }"
                aria-hidden="true"
                >{{ avatar(item.person).initials }}</span
              >
              <span class="flex min-w-0 flex-col leading-normal">
                <span class="text-[13.5px] font-medium">{{ item.text }}</span>
                <span class="text-[12px] text-(--text-muted)">{{ item.when }}</span>
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div class="grid gap-[16px] lg:grid-cols-2">
        <ChartComp title="Tarefas concluídas por semana" :chart-data="weeklyData" />
        <ChartComp title="Abertas por setor" :chart-data="sectorData" />
      </div>
    </section>
  </div>
</template>
