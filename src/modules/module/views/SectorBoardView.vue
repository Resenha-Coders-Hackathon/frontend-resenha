<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import { avatar } from '@/shared/utils/people'
import { useAuthStore } from '@/modules/auth'
import { BoardColumn, TaskPanel } from '../components'
import { getSector } from '../services'
import { useKanbanStore } from '../stores'
import { useSectorAccessStore } from '../stores/access'
import type { CreateTaskRequest, Sector, SectorRole } from '../types'
import { NO_FILTERS, activeFilters, filterTasks, type BoardFilters } from '../utils/board'
import { TOOLBAR_BUTTON } from '../utils/ui'

const props = defineProps<{ sectorId: string }>()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const kanban = useKanbanStore()
const access = useSectorAccessStore()

const sector = ref<(Sector & { my_role: SectorRole }) | null>(null)
const missing = ref(false)
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filters = ref<BoardFilters>({ ...NO_FILTERS })
const panelOpen = ref(false)
const openTaskId = ref<string | null>(null)
const newStatus = ref('')

const canEdit = computed(() => sector.value?.my_role !== 'viewer' && !!sector.value)
const canManage = computed(() => sector.value?.my_role === 'manager')
const openTask = computed(() => kanban.tasks.find((t) => t.id === openTaskId.value) ?? null)
const visible = computed(() =>
  filterTasks(kanban.tasks, filters.value, search.value, auth.user?.id ?? null),
)
const byStatus = (statusId: string) => visible.value.filter((t) => t.status_id === statusId)

const done = computed(() => kanban.tasks.filter((t) => t.completed_at).length)
const percent = computed(() =>
  kanban.tasks.length ? Math.round((done.value / kanban.tasks.length) * 100) : 0,
)
const description = computed(() => {
  const people = access.members.length
  const tasks = kanban.tasks.length
  return `${people} ${people === 1 ? 'pessoa' : 'pessoas'} · ${tasks} ${tasks === 1 ? 'tarefa' : 'tarefas'} · ${percent.value}% concluído`
})

const filtering = computed(() => activeFilters(filters.value) > 0 || !!search.value.trim())
const clearFilters = () => {
  filters.value = { ...NO_FILTERS }
  search.value = ''
}

// atalhos de um clique para os filtros mais usados
const QUICK = [
  { label: 'Minhas', icon: 'person', key: 'assignee', value: 'me' },
  { label: 'Atrasadas', icon: 'schedule', key: 'due', value: 'overdue' },
  { label: 'Prioridade alta', icon: 'flag', key: 'priority', value: 'high+' },
] as const
const toggleQuick = (q: (typeof QUICK)[number]) =>
  (filters.value = { ...filters.value, [q.key]: filters.value[q.key] === q.value ? '' : q.value })

const selectClass =
  'h-9 rounded-full border border-(--border-default) bg-transparent px-3 text-[13px] dark:border-(--border-inverse)'

async function load(id: string) {
  loading.value = true
  missing.value = false
  sector.value = null
  filters.value = { ...NO_FILTERS }
  search.value = ''
  panelOpen.value = false
  try {
    sector.value = await getSector(id)
    await Promise.all([kanban.load(id), access.load(id)])
    // link vindo do calendário: /setores/:id?task=<id>
    const task = route.query.task
    if (typeof task === 'string' && kanban.tasks.some((t) => t.id === task)) openDetails(task)
  } catch (error) {
    missing.value = true
    toast.error(getErrorMessage(error, 'Não foi possível abrir este setor.'))
  } finally {
    loading.value = false
  }
}
watch(() => props.sectorId, load, { immediate: true })

function openCreate(statusId = '') {
  openTaskId.value = null
  newStatus.value = statusId
  panelOpen.value = true
}

function openDetails(id: string) {
  openTaskId.value = id
  panelOpen.value = true
}

async function attempt(action: () => Promise<unknown>, failure: string) {
  saving.value = true
  try {
    await action()
    return true
  } catch (error) {
    toast.error(getErrorMessage(error, failure))
    return false
  } finally {
    saving.value = false
  }
}

async function create(payload: CreateTaskRequest) {
  if (await attempt(() => kanban.addTask(payload), 'Não foi possível criar a tarefa.')) {
    panelOpen.value = false
    toast.success('Tarefa criada.')
  }
}

async function save(id: string, { status, ...fields }: CreateTaskRequest) {
  const ok = await attempt(async () => {
    await kanban.editTask(id, fields)
    if (status && status !== openTask.value?.status_id) await kanban.move(id, status)
  }, 'Não foi possível salvar a tarefa.')
  if (ok) {
    panelOpen.value = false
    toast.success('Tarefa salva.')
  }
}

async function remove(id: string) {
  if (!window.confirm('Excluir esta tarefa? Isso não pode ser desfeito.')) return
  if (await attempt(() => kanban.removeTask(id), 'Não foi possível excluir a tarefa.')) {
    panelOpen.value = false
    toast.success('Tarefa excluída.')
  }
}

async function move(taskId: string, statusId: string, position: number) {
  try {
    await kanban.move(taskId, statusId, position)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível mover a tarefa.'))
  }
}
</script>

<template>
  <div
    class="flex h-[calc(100dvh-3.75rem)] min-h-0 w-full min-w-0 flex-col bg-(--background) md:h-dvh dark:bg-(--background-inverse)"
  >
    <TopbarComp
      v-model:search="search"
      :crumbs="[sector?.name ?? 'Setor']"
      search-placeholder="Buscar nesta lista"
    />

    <section class="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-6 pb-4 sm:px-7">
      <p v-if="missing" role="alert" class="text-sm">
        Setor não encontrado ou sem acesso.
        <RouterLink class="underline" :to="{ name: 'Team' }">Ver equipe e setores</RouterLink>
      </p>

      <template v-else>
        <SubheaderComp
          :title="sector?.name ?? 'Carregando…'"
          :description="sector?.description || description"
          class="mb-0! flex-wrap gap-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="access.members.length"
              class="mr-2 hidden items-center sm:flex"
              :title="access.members.map((m) => m.name).join(', ')"
            >
              <span
                v-for="m in access.members.slice(0, 5)"
                :key="m.user_id"
                class="-ml-1.5 grid size-7 place-items-center rounded-full border-2 border-(--background) text-[10px] font-semibold text-white first:ml-0 dark:border-(--background-inverse)"
                :style="{ backgroundColor: avatar(m.name).color }"
                aria-hidden="true"
                >{{ avatar(m.name).initials }}</span
              >
            </span>
            <BaseButton
              v-if="canManage && sector"
              variant="ghost"
              icon="tune"
              icon-position="left"
              label="Editar setor"
              :full-width="false"
              :class="TOOLBAR_BUTTON"
              @click="router.push({ name: 'SectorEdit', params: { id: sector.id } })"
            />
            <BaseButton
              v-if="canEdit"
              label="Nova tarefa"
              icon="add"
              icon-position="left"
              :full-width="false"
              :class="TOOLBAR_BUTTON"
              @click="openCreate()"
            />
          </div>
        </SubheaderComp>

        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar tarefas">
          <button
            v-for="q in QUICK"
            :key="q.label"
            type="button"
            :aria-pressed="filters[q.key] === q.value"
            :class="[
              'flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
              filters[q.key] === q.value
                ? 'border-(--text-primary) bg-(--text-primary) text-white dark:border-(--text-inverse) dark:bg-(--text-inverse) dark:text-(--text-primary)'
                : 'border-(--border-default) text-(--text-secondary) hover:bg-(--bg-subtle) dark:border-(--border-inverse)',
            ]"
            @click="toggleQuick(q)"
          >
            <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">{{
              q.icon
            }}</span>
            {{ q.label }}
          </button>

          <select v-model="filters.assignee" aria-label="Responsável" :class="selectClass">
            <option value="">Responsável: todos</option>
            <option value="me">Minhas</option>
            <option value="none">Sem responsável</option>
            <option v-for="m in access.members" :key="m.user_id" :value="m.user_id">
              {{ m.name }}
            </option>
          </select>
          <select v-model="filters.priority" aria-label="Prioridade" :class="selectClass">
            <option value="">Prioridade: todas</option>
            <option value="high+">Alta ou urgente</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
          <select v-model="filters.due" aria-label="Entrega" :class="selectClass">
            <option value="">Entrega: qualquer</option>
            <option value="overdue">Atrasadas</option>
            <option value="today">Vence hoje</option>
            <option value="week">Próximos 7 dias</option>
            <option value="none">Sem data</option>
          </select>

          <button
            v-if="filtering"
            type="button"
            class="h-9 rounded-full px-3 text-[13px] text-(--text-secondary) underline"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
          <span v-if="filtering" class="text-[13px] text-(--text-muted)" role="status">
            {{ visible.length }} de {{ kanban.tasks.length }}
            {{ kanban.tasks.length === 1 ? 'tarefa' : 'tarefas' }}
          </span>
        </div>

        <p v-if="loading" role="status" class="text-sm text-(--text-muted)">Carregando o quadro…</p>
        <p v-else-if="!kanban.statuses.length" class="text-sm text-(--text-muted)">
          Este setor ainda não tem colunas.
          <RouterLink
            v-if="canManage && sector"
            class="underline"
            :to="{ name: 'SectorEdit', params: { id: sector.id } }"
            >Criar colunas</RouterLink
          >
        </p>
        <div v-else class="flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto pb-2">
          <BoardColumn
            v-for="status in kanban.statuses"
            :key="status.id"
            :status="status"
            :tasks="byStatus(status.id)"
            :can-edit="canEdit"
            @add="openCreate(status.id)"
            @open="openDetails"
            @drop="(taskId, position) => move(taskId, status.id, position)"
          />
        </div>
      </template>
    </section>

    <TaskPanel
      :open="panelOpen"
      :sector-name="sector?.name ?? ''"
      :statuses="kanban.statuses"
      :members="access.members"
      :task="openTask"
      :initial-status="newStatus"
      :can-edit="canEdit"
      :can-manage="canManage"
      :saving="saving"
      @close="panelOpen = false"
      @create="create"
      @save="save"
      @remove="remove"
      @changed="kanban.reload"
    />
  </div>
</template>
