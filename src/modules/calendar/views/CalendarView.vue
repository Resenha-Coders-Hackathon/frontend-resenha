<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, TopbarComp } from '@/shared/components'
import { ensureGoogleConnected, useGoogleStore } from '@/modules/calendar_sync'
import { useOrganizationsStore } from '@/modules/organizations'
import { listCalendar } from '../services'
import type { CalendarItem, CalendarState } from '../types'
import {
  groupByDate,
  gridRange,
  monthGrid,
  monthTitle,
  shiftMonth,
  stateLabels,
  todayIso,
} from '../utils'

const MAX_CHIPS = 3
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DOT: Record<CalendarState, string> = {
  done: 'bg-[#15924a]',
  late: 'bg-[#dc2626]',
  in_progress: 'bg-[#d97706]',
  todo: 'bg-(--text-muted)',
}
const CHIP: Record<CalendarState, string> = {
  done: 'bg-[#e4f4ea] text-[#127a3e] dark:bg-[#127a3e]/25 dark:text-[#7ed9a2]',
  late: 'bg-[#fde8e8] text-[#c42b2b] dark:bg-[#dc2626]/20 dark:text-[#ff8a8a]',
  in_progress: 'bg-[#fdf1dc] text-[#a35a00] dark:bg-[#d97706]/20 dark:text-[#f5b14c]',
  todo: 'bg-(--bg-muted) text-(--text-secondary) dark:bg-white/10 dark:text-(--text-inverse-muted)',
}

const organizations = useOrganizationsStore()
const router = useRouter()
const google = useGoogleStore()

const today = todayIso()
const [initialYear, initialMonth] = [Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1]
const view = ref({ year: initialYear, month: initialMonth })
const items = ref<CalendarItem[]>([])
const loading = ref(false)

const weeks = computed(() => monthGrid(view.value.year, view.value.month))
const byDate = computed(() => groupByDate(items.value))
// agenda do celular: só o mês aberto, em ordem de data
const agenda = computed(() => {
  const prefix = `${view.value.year}-${String(view.value.month + 1).padStart(2, '0')}`
  return items.value.filter((item) => item.due_date.startsWith(prefix))
})
const agendaDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
const title = computed(() => monthTitle(view.value.year, view.value.month))

let request = 0
async function load() {
  const organization = organizations.current
  const current = ++request
  items.value = []
  if (!organization) return
  loading.value = true
  try {
    const { start, end } = gridRange(weeks.value)
    const loaded = await listCalendar(organization.id, start, end)
    if (current === request) items.value = loaded
  } catch (error) {
    if (current === request)
      toast.error(getErrorMessage(error, 'Não foi possível carregar o calendário.'))
  } finally {
    if (current === request) loading.value = false
  }
}

watch([() => organizations.current?.id, view], load, { immediate: true })
onMounted(() => void google.loadStatus())

const go = (delta: number) => (view.value = shiftMonth(view.value.year, view.value.month, delta))
const goToday = () => (view.value = { year: initialYear, month: initialMonth })

async function connectGoogle() {
  try {
    await ensureGoogleConnected({ returnTo: '/calendario' })
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível conectar o Google Agenda.'))
  }
}

const openItem = (item: CalendarItem) =>
  router.push({
    name: 'SectorBoard',
    params: { sectorId: item.sector_id },
    query: { task: item.id },
  })
// tarefas que já estão no Google Agenda ganham anel azul e o ícone de agenda
const GOOGLE_RING = 'ring-2 ring-[#2563eb] ring-offset-1 dark:ring-[#8fb1ff]'

const dayLabel = (date: string, count: number) =>
  `${new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}: ${
    count ? `${count} ${count === 1 ? 'entrega' : 'entregas'}` : 'sem entregas'
  }`
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Calendário']" />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <header class="flex flex-wrap items-end justify-between gap-[12px]">
        <div>
          <div class="flex items-center gap-[6px]">
            <h1
              class="text-[26px]! leading-tight! font-semibold! tracking-[-0.02em]!"
              aria-live="polite"
            >
              {{ title }}
            </h1>
            <button
              type="button"
              class="grid size-[32px] cursor-pointer place-items-center rounded-[8px] hover:bg-(--bg-muted) dark:hover:bg-white/10"
              aria-label="Mês anterior"
              @click="go(-1)"
            >
              <span class="material-symbols-outlined text-[20px]!" aria-hidden="true"
                >chevron_left</span
              >
            </button>
            <button
              type="button"
              class="grid size-[32px] cursor-pointer place-items-center rounded-[8px] hover:bg-(--bg-muted) dark:hover:bg-white/10"
              aria-label="Próximo mês"
              @click="go(1)"
            >
              <span class="material-symbols-outlined text-[20px]!" aria-hidden="true"
                >chevron_right</span
              >
            </button>
          </div>
          <p class="text-[14px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
            Entregas de todos os setores que você acompanha
          </p>
        </div>

        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            label="Hoje"
            variant="secondary"
            :full-width="false"
            class="mt-0!"
            @click="goToday"
          />
          <BaseButton
            v-if="google.status.connected"
            label="Google Agenda conectada"
            icon="check"
            icon-position="left"
            variant="secondary"
            :full-width="false"
            class="mt-0!"
            disabled
          />
          <BaseButton
            v-else
            label="Conectar Google Agenda"
            icon="calendar_month"
            icon-position="left"
            variant="secondary"
            :full-width="false"
            class="mt-0!"
            @click="connectGoogle"
          />
        </div>
      </header>

      <div
        class="rounded-[16px] border border-(--border-default) bg-(--surface) p-[16px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        :aria-busy="loading"
      >
        <div
          class="grid grid-cols-7 gap-[6px] pb-[8px] text-[12px] text-(--text-muted)"
          aria-hidden="true"
        >
          <span v-for="weekday in WEEKDAYS" :key="weekday" class="px-[6px]">{{ weekday }}</span>
        </div>

        <div class="grid gap-[6px]">
          <div v-for="(week, w) in weeks" :key="w" class="grid grid-cols-7 gap-[6px]">
            <div
              v-for="day in week"
              :key="day.date"
              role="group"
              :aria-label="dayLabel(day.date, byDate.get(day.date)?.length ?? 0)"
              :class="[
                'flex min-h-[84px] min-w-0 flex-col gap-[4px] rounded-[10px] border p-[6px] sm:min-h-[118px]',
                day.date === today
                  ? 'border-[#f6c6ae] bg-[#fdeadf] dark:border-[#ff6700]/40 dark:bg-[#ff6700]/10'
                  : day.inMonth
                    ? 'border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)'
                    : 'border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20',
              ]"
            >
              <span
                :class="[
                  'text-[13px] leading-none',
                  day.date === today
                    ? 'font-semibold text-[#c42b2b] dark:text-[#ff8a8a]'
                    : day.inMonth
                      ? ''
                      : 'text-(--text-muted)',
                ]"
                >{{ day.day }}</span
              >
              <div
                v-if="byDate.get(day.date)"
                class="flex flex-wrap gap-[3px] sm:hidden"
                aria-hidden="true"
              >
                <span
                  v-for="item in byDate.get(day.date)!.slice(0, MAX_CHIPS)"
                  :key="item.id"
                  :class="['size-[6px] rounded-full', DOT[item.state]]"
                />
              </div>
              <ul v-if="byDate.get(day.date)" class="hidden min-w-0 flex-col gap-[3px] sm:flex">
                <li v-for="item in byDate.get(day.date)!.slice(0, MAX_CHIPS)" :key="item.id">
                  <button
                    type="button"
                    :class="[
                      'flex w-full cursor-pointer items-center gap-[4px] rounded-[5px] px-[6px] py-[2px] text-left text-[11.5px] leading-[16px]',
                      CHIP[item.state],
                      item.in_google && GOOGLE_RING,
                    ]"
                    :title="`${item.title} · ${item.sector_name} · ${stateLabels[item.state]}${item.assignee_name ? ` · ${item.assignee_name}` : ''}${item.in_google ? ' · no Google Agenda' : ''}`"
                    @click="openItem(item)"
                  >
                    <span
                      v-if="item.in_google"
                      class="material-symbols-outlined text-[13px]!"
                      aria-label="No Google Agenda"
                      >event_available</span
                    >
                    <span class="truncate">{{ item.title }}</span>
                  </button>
                </li>
                <li
                  v-if="byDate.get(day.date)!.length > MAX_CHIPS"
                  class="px-[6px] text-[11.5px] text-(--text-muted)"
                >
                  +{{ byDate.get(day.date)!.length - MAX_CHIPS }} mais
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section v-if="agenda.length" class="sm:hidden" aria-label="Entregas do mês">
        <h2 class="pb-[8px] text-[15px]! leading-normal! font-semibold! tracking-normal!">
          Neste mês
        </h2>
        <ul
          class="rounded-[16px] border border-(--border-default) bg-(--surface) px-[14px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <li
            v-for="item in agenda"
            :key="item.id"
            class="flex cursor-pointer items-center gap-[10px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            @click="openItem(item)"
          >
            <span
              :class="['size-[8px] shrink-0 rounded-full', DOT[item.state]]"
              aria-hidden="true"
            />
            <span class="flex min-w-0 flex-1 flex-col leading-normal">
              <span class="truncate text-[14px] font-medium"
                ><span
                  v-if="item.in_google"
                  class="material-symbols-outlined mr-[4px] align-middle text-[15px]! text-[#2563eb]"
                  aria-label="No Google Agenda"
                  >event_available</span
                >{{ item.title }}</span
              >
              <span class="truncate text-[12px] text-(--text-muted)"
                >{{ agendaDate(item.due_date) }} · {{ item.sector_name }}</span
              >
            </span>
            <span
              :class="['shrink-0 rounded-[6px] px-[8px] py-[2px] text-[11.5px]', CHIP[item.state]]"
              >{{ stateLabels[item.state] }}</span
            >
          </li>
        </ul>
      </section>

      <p v-if="!loading && !items.length" class="text-[13px] text-(--text-muted)">
        Nenhuma entrega com data neste período. Tarefas com prazo aparecem aqui.
      </p>
    </section>
  </div>
</template>
