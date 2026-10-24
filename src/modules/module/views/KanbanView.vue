<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, BaseInput } from '@/shared/components'
import type { TaskPriority } from '@/shared/types'
import { syncTaskToCalendar } from '@/modules/calendar_sync/services'
import { useOrganizationsStore } from '@/modules/organizations'
import { SubheaderKanban, KanbanColumn } from '../components'
import { useKanbanStore, useSectorsStore } from '../stores'

const organizations = useOrganizationsStore()
const sectors = useSectorsStore()
const kanban = useKanbanStore()

const sectorId = ref('')
const loading = ref(false)
const dialog = ref<HTMLDialogElement | null>(null)
const saving = ref(false)
const form = ref({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '', status: '' })
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
    await kanban.load(id)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível carregar o mural.'))
  }
})

function openCreate(statusId = '') {
  form.value = { title: '', description: '', priority: 'medium', due_date: '', status: statusId }
  dialog.value?.showModal()
}

async function create() {
  if (saving.value || !form.value.title.trim()) return
  saving.value = true
  try {
    const { title, description, priority, due_date, status } = form.value
    await kanban.addTask({
      title: title.trim(),
      description,
      priority,
      ...(due_date && { due_date }),
      ...(status && { status }),
    })
    dialog.value?.close()
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
    toast.error(
      getErrorMessage(error, 'Conecte o Google em Configurações para usar o calendário.'),
    )
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

    <dialog
      ref="dialog"
      class="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-(--border-default) bg-(--surface) p-6 text-(--text-primary) dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    >
      <form class="grid gap-1" @submit.prevent="create">
        <h2 class="text-xl font-semibold">Nova tarefa</h2>
        <BaseInput v-model="form.title" label="Título" required />
        <BaseInput v-model="form.description" label="Descrição" />
        <BaseInput v-model="form.due_date" label="Entrega" type="date" />
        <label class="mt-5 grid gap-1 text-sm">
          Prioridade
          <select
            v-model="form.priority"
            class="rounded-xl border border-(--border-default) bg-transparent px-3 py-2 dark:border-(--border-inverse)"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </label>
        <div class="mt-5 flex justify-end gap-2">
          <BaseButton label="Cancelar" variant="ghost" :full-width="false" @click="dialog?.close()" />
          <BaseButton label="Criar tarefa" type="submit" :full-width="false" :loading="saving" />
        </div>
      </form>
    </dialog>
  </section>
</template>
