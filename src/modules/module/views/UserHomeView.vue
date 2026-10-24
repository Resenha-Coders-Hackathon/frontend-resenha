<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, CardComp, ChartComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { useNotificationsStore } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'
import { getDashboard } from '../services'
import type { Dashboard } from '../types'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'
import { activityText, dueBadge, kpis, relativeTime, weekLabel } from '../utils/userHome'

const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const notifications = useNotificationsStore()

const data = ref<Dashboard | null>(null)
const loading = ref(false)

// O dashboard é da organização escolhida na barra lateral.
watch(
  () => organizations.current?.id,
  async (id) => {
    data.value = null
    if (!id) return
    loading.value = true
    try {
      const loaded = await getDashboard(id)
      if (id === organizations.current?.id) data.value = loaded
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível carregar o dashboard.'))
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

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
const todayIso = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD no fuso local
const description = computed(
  () =>
    `${today.charAt(0).toUpperCase()}${today.slice(1)} · você tem ${data.value?.open_tasks ?? 0} tarefas abertas`,
)

const cards = computed(() => (data.value ? kpis(data.value, notifications.unreadCount) : []))

const weeklyData = computed(() => ({
  labels: (data.value?.weekly_done ?? []).map((w) => weekLabel(w.week_start)),
  datasets: [
    {
      label: 'Tarefas concluídas',
      ...CHART_STYLE,
      data: (data.value?.weekly_done ?? []).map((w) => w.done),
    },
  ],
}))

const sectorData = computed(() => ({
  labels: (data.value?.open_by_sector ?? []).map((s) => s.sector),
  datasets: [
    {
      label: 'Tarefas abertas',
      ...CHART_STYLE,
      data: (data.value?.open_by_sector ?? []).map((s) => s.open),
    },
  ],
}))
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="[organizations.current?.name ?? 'Início', 'Início']" has-notifications />

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
          v-for="kpi in cards"
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
          <p v-if="loading" role="status" class="py-[12px] text-[13px] text-(--text-muted)">
            Carregando…
          </p>
          <p v-else-if="!data?.today.length" class="py-[12px] text-[13px] text-(--text-muted)">
            Nada para hoje. Tarefas atribuídas a você com entrega até amanhã aparecem aqui.
          </p>
          <ul class="flex flex-col">
            <li
              v-for="item in data?.today"
              :key="item.id"
              class="flex items-center gap-[12px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            >
              <span
                class="grid size-[32px] shrink-0 place-items-center rounded-[9px] bg-(--bg-muted) dark:bg-black/30"
                aria-hidden="true"
              >
                <span
                  class="material-symbols-outlined text-[17px]! text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >view_kanban</span
                >
              </span>
              <span class="flex min-w-0 flex-1 flex-col leading-normal">
                <span class="truncate text-[13.5px] font-medium">{{ item.title }}</span>
                <span class="text-[12px] text-(--text-muted)">{{ item.sector_name }}</span>
              </span>
              <span
                :class="[
                  BADGE_BASE,
                  BADGE[dueBadge(item.due_date, item.is_overdue, todayIso).tone],
                ]"
                >{{ dueBadge(item.due_date, item.is_overdue, todayIso).label }}</span
              >
            </li>
          </ul>
        </section>

        <section
          class="flex flex-col rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] pt-[16px] pb-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <h2 class="pb-[4px] text-[15px]! leading-normal! font-semibold! tracking-normal!">
            Atividade recente
          </h2>
          <p
            v-if="!loading && !data?.activity.length"
            class="py-[12px] text-[13px] text-(--text-muted)"
          >
            Sem atividade ainda. Comentários e tarefas concluídas aparecem aqui.
          </p>
          <ul class="flex flex-col">
            <li
              v-for="item in data?.activity"
              :key="`${item.kind}-${item.at}-${item.task_title}`"
              class="flex items-center gap-[12px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            >
              <span
                :class="[
                  'grid size-[32px] shrink-0 place-items-center rounded-full text-[11px] leading-none font-semibold text-white',
                  avatar(item.person ?? '?').color
                    ? ''
                    : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                ]"
                :style="{ backgroundColor: avatar(item.person ?? '?').color || undefined }"
                aria-hidden="true"
                >{{ avatar(item.person ?? '?').initials }}</span
              >
              <span class="flex min-w-0 flex-col leading-normal">
                <span class="text-[13.5px] font-medium">{{ activityText(item) }}</span>
                <span class="text-[12px] text-(--text-muted)">{{ relativeTime(item.at) }}</span>
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
