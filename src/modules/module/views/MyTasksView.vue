<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import { MY_TASKS, TASK_PRIORITY, TASK_STATUS, type MyTask } from '../utils/myTasks'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: as tarefas são de exemplo, sem backend.

const router = useRouter()
const tab = ref('open')

const FILTERS: Record<string, (task: MyTask) => boolean> = {
  open: (task) => task.status !== 'done',
  overdue: (task) => task.overdue,
  done: (task) => task.status === 'done',
  mine: (task) => task.createdByMe,
}

const tabs = computed(() => [
  { id: 'open', label: `Abertas · ${MY_TASKS.filter(FILTERS.open!).length}` },
  { id: 'overdue', label: `Atrasadas · ${MY_TASKS.filter(FILTERS.overdue!).length}` },
  { id: 'done', label: 'Concluídas' },
  { id: 'mine', label: 'Criadas por mim' },
])

const rows = computed(() => MY_TASKS.filter(FILTERS[tab.value] ?? (() => true)))
const COLUMNS = ['Tarefa', 'Setor', 'Status', 'Prioridade', 'Entrega', 'Responsável']
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-3.5rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Norte Studio', 'Minhas tarefas']" has-notifications />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Minhas tarefas"
        description="Tudo que está com você, em todos os setores"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            label="Filtros"
            icon="tune"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
          />
          <BaseButton
            label="Nova tarefa"
            icon="add"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push({ name: 'Mural' })"
          />
        </div>
      </SubheaderComp>

      <div
        role="tablist"
        aria-label="Filtrar tarefas"
        class="flex gap-[22px] overflow-x-auto border-b border-(--border-default) dark:border-(--border-inverse)"
      >
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="tab === item.id"
          :class="[
            '-mb-px shrink-0 cursor-pointer border-b-2 py-[10px] text-[14px] leading-normal font-medium whitespace-nowrap transition-colors',
            tab === item.id
              ? 'border-(--text-primary) dark:border-(--text-inverse)'
              : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)',
          ]"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div
        class="overflow-x-auto rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <table class="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
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
              v-for="task in rows"
              :key="task.id"
              class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
            >
              <td class="px-[18px] py-[12px] font-semibold">{{ task.title }}</td>
              <td
                class="px-[18px] py-[12px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >
                {{ task.sector }}
              </td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, BADGE[TASK_STATUS[task.status].tone]]">{{
                  TASK_STATUS[task.status].label
                }}</span>
              </td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, BADGE[TASK_PRIORITY[task.priority].tone]]">{{
                  TASK_PRIORITY[task.priority].label
                }}</span>
              </td>
              <td
                :class="[
                  'px-[18px] py-[12px]',
                  task.overdue
                    ? 'font-medium text-(--destructive)'
                    : 'text-(--text-secondary) dark:text-(--text-inverse-muted)',
                ]"
              >
                {{ task.due }}
              </td>
              <td class="px-[18px] py-[12px]">
                <span class="flex items-center gap-[8px]">
                  <span
                    :class="[
                      'grid size-[24px] shrink-0 place-items-center rounded-full text-[9px] leading-none font-semibold text-white',
                      avatar(task.assignee).color
                        ? ''
                        : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                    ]"
                    :style="{ backgroundColor: avatar(task.assignee).color || undefined }"
                    aria-hidden="true"
                    >{{ avatar(task.assignee).initials }}</span
                  >
                  {{ task.assignee }}
                </span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td
                :colspan="COLUMNS.length"
                class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
              >
                Nenhuma tarefa neste filtro.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
