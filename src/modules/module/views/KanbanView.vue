<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrganizationsStore } from '@/modules/organizations'
import { useAuthStore } from '@/modules/auth'
import { getErrorMessage } from '@/app/plugins/axios'
import { useKanbanStore, useSectorsStore } from '../stores'
import { SubheaderKanban, KanbanColumn } from '../components'
import KanbanColumnForm from '../components/kanbanColumnForm.vue'
import KanbanTaskForm from '../components/kanbanTaskForm.vue'
import KanbanTaskDrawer from '../components/kanbanTaskDrawer.vue'
import type { Status, Task } from '../types'
import '../styles/kanban.css'

const route = useRoute()
const router = useRouter()
const organizations = useOrganizationsStore()
const sectors = useSectorsStore()
const board = useKanbanStore()
const auth = useAuthStore()
const organizationId = ref('')
const sectorId = ref('')
const loading = ref(true)
const boardReady = ref(false)
const moving = ref(false)
const error = ref('')
const notice = ref('')
const search = ref('')
const filter = ref('all')
const draggingId = ref<string | null>(null)
const columnForm = ref(false)
const editingColumn = ref<Status>()
const taskFormStatus = ref<string | null>(null)
const selectedTaskId = ref<string | null>(null)
const selectedTask = computed(() => board.tasks.find((task) => task.id === selectedTaskId.value))
const sector = computed(() => sectors.sectors.find((item) => item.id === sectorId.value))
const activeBoard = computed(
  () => boardReady.value && !!sectorId.value && board.sectorId === sectorId.value,
)
const progress = computed(() =>
  board.tasks.length
    ? Math.round(
        (board.tasks.filter((task) => task.completed_at).length / board.tasks.length) * 100,
      )
    : 0,
)
const filters = [
  { id: 'all', label: 'Todas', icon: '' },
  { id: 'mine', label: 'Minhas', icon: 'person' },
  { id: 'overdue', label: 'Atrasadas', icon: 'schedule' },
  { id: 'high', label: 'Prioridade alta', icon: 'flag' },
]
const filteredTasks = computed(() =>
  board.tasks.filter((task) => {
    const matches = `${task.title} ${task.description} ${task.assignee_name || ''}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.value.toLocaleLowerCase('pt-BR').trim())
    return (
      matches &&
      (filter.value === 'all' ||
        (filter.value === 'mine' && !!auth.user && task.assignee_id === auth.user.id) ||
        (filter.value === 'overdue' && task.is_overdue) ||
        (filter.value === 'high' && ['high', 'urgent'].includes(task.priority)))
    )
  }),
)
function columnTasks(id: string): Task[] {
  return filteredTasks.value
    .filter((task) => task.status_id === id)
    .sort((a, b) => a.position - b.position)
}
let loadVersion = 0
async function loadBoard(id: string) {
  const version = ++loadVersion
  boardReady.value = false
  sectorId.value = id
  selectedTaskId.value = null
  taskFormStatus.value = null
  columnForm.value = false
  error.value = ''
  notice.value = ''
  if (!id) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    await board.load(id)
    if (version !== loadVersion) return
    boardReady.value = true
    if (
      typeof route.query.task === 'string' &&
      board.tasks.some((task) => task.id === route.query.task)
    )
      selectedTaskId.value = route.query.task
  } catch (cause) {
    if (version === loadVersion)
      error.value = getErrorMessage(cause, 'Não foi possível carregar o quadro.')
  } finally {
    if (version === loadVersion) loading.value = false
  }
}
async function loadOrganization(id: string, preferredSector?: string) {
  const version = ++loadVersion
  organizationId.value = id
  boardReady.value = false
  sectorId.value = ''
  selectedTaskId.value = null
  error.value = ''
  loading.value = true
  try {
    await sectors.load(id)
    if (version !== loadVersion) return
    const selected =
      sectors.sectors.find((item) => item.id === preferredSector) ?? sectors.sectors[0]
    await loadBoard(selected?.id ?? '')
  } catch (cause) {
    if (version === loadVersion) {
      error.value = getErrorMessage(cause, 'Não foi possível carregar os setores.')
      loading.value = false
    }
  }
}
async function initialize() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([organizations.load(), auth.user ? Promise.resolve() : auth.loadUser()])
    const preferred =
      typeof route.query.organization === 'string' ? route.query.organization : organizationId.value
    const organization =
      organizations.organizations.find((item) => item.id === preferred) ??
      organizations.organizations[0]
    if (organization)
      await loadOrganization(
        organization.id,
        typeof route.query.sector === 'string' ? route.query.sector : (board.sectorId ?? undefined),
      )
    else loading.value = false
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível carregar suas organizações.')
    loading.value = false
  }
}
onMounted(initialize)
watch(
  () => [route.query.organization, route.query.sector],
  ([org, sector]) => {
    if (loading.value || moving.value) return
    if (typeof org === 'string' && org !== organizationId.value)
      void loadOrganization(org, typeof sector === 'string' ? sector : undefined)
    else if (
      typeof sector === 'string' &&
      sector !== sectorId.value &&
      sectors.sectors.some((item) => item.id === sector)
    )
      void loadBoard(sector)
  },
)
function openColumn(status?: Status) {
  editingColumn.value = status
  columnForm.value = true
}
function createTask(statusId?: string) {
  const id = statusId ?? board.statuses[0]?.id
  if (id) taskFormStatus.value = id
  else {
    notice.value = 'Crie uma coluna antes de adicionar tarefas.'
    openColumn()
  }
}
async function moveTask(id: string, statusId: string) {
  draggingId.value = null
  if (
    moving.value ||
    loading.value ||
    board.tasks.find((task) => task.id === id)?.status_id === statusId
  )
    return
  moving.value = true
  error.value = ''
  try {
    await board.move(id, statusId)
    notice.value = 'Status da tarefa atualizado.'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível mover a tarefa.')
  } finally {
    moving.value = false
  }
}
async function share() {
  const target = router.resolve({
    path: route.path,
    query: { organization: organizationId.value, sector: sectorId.value },
  })
  try {
    await navigator.clipboard.writeText(new URL(target.href, window.location.href).href)
    notice.value = 'Link do quadro copiado. O acesso depende das permissões do setor.'
  } catch {
    error.value = 'Não foi possível copiar o link. Verifique a permissão da área de transferência.'
  }
}
function created(id: string) {
  taskFormStatus.value = null
  selectedTaskId.value = id
  notice.value = 'Tarefa criada.'
}
</script>

<template>
  <section class="min-h-dvh min-w-0 px-4 py-6 sm:px-6 lg:px-7">
    <SubheaderKanban
      :title="sector?.name || 'Meu quadro'"
      :description="sector?.description || 'Organize o trabalho da equipe, uma tarefa de cada vez.'"
      :progress="activeBoard ? progress : 0"
      :total="activeBoard ? board.tasks.length : 0"
      :disabled="loading || moving || !activeBoard"
      @create="createTask()"
      @column="openColumn()"
      @share="share"
    />
    <div class="my-5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar tarefas">
        <button
          v-for="item in filters"
          :key="item.id"
          class="kb-filter"
          :class="{ active: filter === item.id }"
          :aria-pressed="filter === item.id"
          @click="filter = item.id"
        >
          <span
            v-if="item.icon"
            class="material-symbols-outlined text-[15px]!"
            aria-hidden="true"
            >{{ item.icon }}</span
          >{{ item.label }}
        </button>
      </div>
    </div>
    <div v-if="error" class="kb-error mb-4" role="alert">
      {{ error }}
      <button v-if="!moving && !loading" class="underline" @click="initialize">
        Recarregar quadro
      </button>
    </div>
    <p v-if="notice" role="status" class="mb-3 text-xs text-(--kanban-secondary)">{{ notice }}</p>
    <div v-if="loading" class="py-20 text-center text-sm text-(--kanban-muted)" role="status">
      Carregando seu quadro…
    </div>
    <div v-else-if="!organizations.organizations.length && !error" class="kb-empty">
      <span class="material-symbols-outlined text-4xl!" aria-hidden="true">domain_add</span>
      <h2>Seu próximo projeto começa aqui</h2>
      <p>Crie uma organização para organizar as tarefas da sua equipe.</p>
      <RouterLink class="kb-small-button" to="/organizacoes">Ir para organizações</RouterLink>
    </div>
    <div v-else-if="!sectorId && !error" class="kb-empty">
      <h2>Nenhum setor disponível</h2>
      <p>Crie um setor na sua organização para começar o quadro.</p>
      <RouterLink
        class="kb-small-button"
        :to="{ name: 'OrganizationOnboardingSectors', params: { organizationId } }"
        >Configurar setores</RouterLink
      >
    </div>
    <template v-else-if="activeBoard">
      <p
        v-if="board.tasks.length && !filteredTasks.length"
        class="mb-4 text-xs text-(--kanban-muted)"
      >
        Nenhuma tarefa encontrada. Experimente outro filtro ou busca.
      </p>
      <div class="kb-board" :aria-busy="moving">
        <KanbanColumn
          v-for="status in board.statuses"
          :key="status.id"
          :status="status"
          :tasks="columnTasks(status.id)"
          :total="board.tasksByStatus(status.id).length"
          :dragging-id="draggingId"
          :disabled="moving"
          @open="selectedTaskId = $event"
          @create="createTask"
          @edit="openColumn"
          @move="moveTask"
          @drag="draggingId = $event"
        /><button class="kb-new-column" :disabled="moving" @click="openColumn()">
          <span class="material-symbols-outlined" aria-hidden="true">add</span>Nova coluna
        </button>
      </div>
      <p class="mt-4 text-[11px] text-(--kanban-muted)">
        Arraste os cards entre as colunas ou abra uma tarefa para mudar seu status.
      </p>
    </template>
    <KanbanColumnForm v-if="columnForm" :status="editingColumn" @close="columnForm = false" />
    <KanbanTaskForm
      v-if="taskFormStatus"
      :status-id="taskFormStatus"
      @close="taskFormStatus = null"
      @created="created"
    />
    <KanbanTaskDrawer
      v-if="selectedTask"
      :key="selectedTask.id"
      :task="selectedTask"
      :sector-name="sector?.name || ''"
      @close="selectedTaskId = null"
    />
  </section>
</template>
