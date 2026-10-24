<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { syncTaskToCalendar } from '@/modules/calendar_sync/services'
import { useOrganizationsStore } from '@/modules/organizations'
import { SubheaderKanban, KanbanColumn, TaskDrawer } from '../components'
import { useKanbanStore, useSectorsStore } from '../stores'
import { useSectorAccessStore } from '../stores/access'
import type { CreateTaskRequest } from '../types'

const organizations = useOrganizationsStore()
const sectors = useSectorsStore()
const kanban = useKanbanStore()
const access = useSectorAccessStore()

const sectorId = ref('')
const loading = ref(false)
const drawerOpen = ref(false)
const saving = ref(false)
const drawerStatus = ref('')
const sector = computed(() => sectors.sectors.find((s) => s.id === sectorId.value))

// A organização escolhida na barra lateral define os setores do mural.
watch(
  () => organizations.current?.id,
  async (id) => {
    sectorId.value = ''
    if (!id) return
    loading.value = true
    try {
      await sectors.load(id)
      sectorId.value = sectors.sectors[0]?.id ?? ''
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível carregar os setores.'))
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

watch(sectorId, async (id) => {
  if (!id) return
  try {
    await Promise.all([kanban.load(id), access.load(id)])
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível carregar o mural.'))
  }
})

function openCreate(statusId = '') {
  drawerStatus.value = statusId
  drawerOpen.value = true
}

async function create(payload: CreateTaskRequest) {
  saving.value = true
  try {
    await kanban.addTask(payload)
    drawerOpen.value = false
    toast.success('Tarefa criada.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível criar a tarefa.'))
  } finally {
    saving.value = false
  }
}

async function move(taskId: string, statusId: string) {
  try {
    await kanban.move(taskId, statusId)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível mover a tarefa.'))
  }
}

async function addToCalendar(taskId: string) {
  try {
    await syncTaskToCalendar(taskId)
    toast.success('Tarefa adicionada ao Google Calendar.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Conecte o Google em Configurações para usar o calendário.'))
  }
}
</script>

<template>
  <section class="mx-auto flex w-full flex-col pb-6 px-4 pt-10 sm:px-6 md:px-8 xl:px-10">
    <SubheaderKanban
      :title="sector?.name ?? 'Mural'"
      :description="organizations.current?.name ?? 'Escolha uma organização na barra lateral'"
      @new-task="openCreate()"
    >
      <select
        v-if="sectors.sectors.length"
        v-model="sectorId"
        aria-label="Setor"
        class="rounded-xl border border-(--border-default) bg-transparent px-3 py-2 text-sm dark:border-(--border-inverse)"
      >
        <option v-for="s in sectors.sectors" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </SubheaderKanban>

    <p v-if="loading" role="status" class="mt-5">Carregando…</p>
    <p v-else-if="!sectors.sectors.length" class="mt-5">
      Esta organização ainda não tem setores.
      <RouterLink
        v-if="organizations.current"
        class="underline"
        :to="{
          name: 'OrganizationOnboardingSectors',
          params: { organizationId: organizations.current.id },
        }"
        >Criar setor</RouterLink
      >
    </p>
    <div v-else class="my-5 flex gap-5 overflow-x-auto pb-2">
      <KanbanColumn
        v-for="status in kanban.statuses"
        :key="status.id"
        :status="status"
        :tasks="kanban.tasksByStatus(status.id)"
        :statuses="kanban.statuses"
        @add="openCreate(status.id)"
        @move="move"
        @calendar="addToCalendar"
      />
    </div>

    <TaskDrawer
      :open="drawerOpen"
      :sector-name="sector?.name ?? ''"
      :statuses="kanban.statuses"
      :members="access.members"
      :initial-status="drawerStatus"
      :saving="saving"
      @close="drawerOpen = false"
      @submit="create"
    />
  </section>
</template>
