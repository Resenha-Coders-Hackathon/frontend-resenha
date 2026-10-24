<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { getErrorMessage } from '@/app/plugins/axios'
import { fetchAllPages } from '@/shared/utils'
import { useKanbanStore } from '../stores'
import {
  listChecklist,
  listComments,
  listSectorMembers,
  updateChecklistItem,
  createChecklistItem,
  createComment,
} from '../services'
import type { ChecklistItem, Comment, SectorMember, Task } from '../types'
import { formatTaskDate, priorityLabels } from '../utils/kanban'
import KanbanDialog from './kanbanDialog.vue'

interface Props {
  task: Task
  sectorName: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const board = useKanbanStore()
const loading = ref(true)
const saving = ref(false)
const moving = ref(false)
const writing = ref(false)
const error = ref('')
const detailError = ref('')
const checklist = ref<ChecklistItem[]>([])
const comments = ref<Comment[]>([])
const members = ref<SectorMember[]>([])
const newItem = ref('')
const newComment = ref('')
const pendingItems = ref(new Set<string>())
const statusId = ref(props.task.status_id)
const form = reactive({
  title: props.task.title,
  description: props.task.description,
  priority: props.task.priority,
  due_date: props.task.due_date || '',
  assignee: props.task.assignee_id || '',
})
const completed = computed(() => checklist.value.filter((item) => item.is_done).length)
const currentStatus = computed(() =>
  board.statuses.find((status) => status.id === props.task.status_id),
)
const busy = computed(
  () => saving.value || moving.value || writing.value || pendingItems.value.size > 0,
)
async function loadDetails() {
  loading.value = true
  detailError.value = ''
  try {
    const [items, messages, people] = await Promise.all([
      fetchAllPages((page) => listChecklist(props.task.id, page)),
      fetchAllPages((page) => listComments(props.task.id, page)),
      fetchAllPages((page) => listSectorMembers(props.task.sector_id, page)),
    ])
    checklist.value = items.sort((a, b) => a.position - b.position)
    comments.value = messages
    members.value = people
  } catch (cause) {
    detailError.value = getErrorMessage(cause, 'Não foi possível carregar os detalhes.')
  } finally {
    loading.value = false
  }
}
onMounted(loadDetails)
async function save() {
  if (!form.title.trim() || busy.value) return
  saving.value = true
  error.value = ''
  try {
    await board.editTask(props.task.id, {
      ...form,
      title: form.title.trim(),
      due_date: form.due_date || null,
      assignee: form.assignee || null,
    })
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível salvar a tarefa.')
  } finally {
    saving.value = false
  }
}
async function changeStatus() {
  if (busy.value || statusId.value === props.task.status_id) return
  moving.value = true
  error.value = ''
  try {
    await board.move(props.task.id, statusId.value)
  } catch (cause) {
    statusId.value = props.task.status_id
    error.value = getErrorMessage(cause, 'Não foi possível mudar o status.')
  } finally {
    moving.value = false
  }
}
async function toggle(item: ChecklistItem) {
  if (pendingItems.value.has(item.id)) return
  pendingItems.value.add(item.id)
  error.value = ''
  try {
    const updated = await updateChecklistItem(props.task.id, item.id, { is_done: !item.is_done })
    checklist.value = checklist.value.map((entry) => (entry.id === item.id ? updated : entry))
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível atualizar o checklist.')
  } finally {
    pendingItems.value.delete(item.id)
  }
}
async function addItem() {
  if (!newItem.value.trim() || writing.value) return
  writing.value = true
  error.value = ''
  try {
    const item = await createChecklistItem(props.task.id, {
      content: newItem.value.trim(),
      position: Math.max(-1, ...checklist.value.map((entry) => entry.position)) + 1,
    })
    checklist.value.push(item)
    newItem.value = ''
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível adicionar o item.')
  } finally {
    writing.value = false
  }
}
async function sendComment() {
  if (!newComment.value.trim() || writing.value) return
  writing.value = true
  error.value = ''
  try {
    comments.value.push(await createComment(props.task.id, newComment.value.trim()))
    newComment.value = ''
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível enviar o comentário.')
  } finally {
    writing.value = false
  }
}
</script>
<template>
  <KanbanDialog
    :title="`${task.id.slice(0, 8).toUpperCase()} · ${sectorName}`"
    drawer
    @close="!busy && emit('close')"
  >
    <div class="grid gap-6">
      <h3 class="text-[22px] leading-7 font-semibold tracking-tight break-words">
        {{ task.title }}
      </h3>
      <div class="grid gap-3 text-[13px]">
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">radio_button_checked</span
            >Status</span
          >
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="statusId"
              class="kb-input kb-status-select"
              aria-label="Novo status da tarefa"
              :disabled="busy"
              :style="{ '--status-color': currentStatus?.color }"
            >
              <option v-for="status in board.statuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option></select
            ><button
              class="kb-small-button"
              :disabled="busy || statusId === task.status_id"
              @click="changeStatus"
            >
              {{ moving ? 'Movendo…' : 'Mudar status' }}
            </button>
          </div>
        </div>
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">person</span
            >Responsável</span
          ><span>{{ task.assignee_name || 'Sem responsável' }}</span>
        </div>
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">calendar_today</span>Criada
            em</span
          ><time :datetime="task.created_at" class="font-mono text-xs">{{
            formatTaskDate(task.created_at, true)
          }}</time>
        </div>
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">flag</span>Entrega</span
          ><span :class="{ 'text-(--kanban-danger)': task.is_overdue }"
            >{{ formatTaskDate(task.due_date, true) }}
            <span v-if="task.is_overdue" class="ml-1 text-[11px]">· Atrasada</span></span
          >
        </div>
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">layers</span
            >Prioridade</span
          ><span :class="`kb-priority-${task.priority}`">{{ priorityLabels[task.priority] }}</span>
        </div>
        <div class="kb-property">
          <span class="kb-property-label"
            ><span class="material-symbols-outlined" aria-hidden="true">domain</span>Setor</span
          ><span>{{ sectorName }}</span>
        </div>
      </div>
      <section>
        <h4 class="mb-2 text-sm font-semibold">Descrição</h4>
        <p class="whitespace-pre-wrap text-[13px] leading-[21px] text-(--kanban-secondary)">
          {{ task.description || 'Esta tarefa ainda não tem descrição.' }}
        </p>
      </section>
      <p v-if="error" class="kb-error" role="alert">{{ error }}</p>
      <details class="rounded-xl border border-(--kanban-border) p-3">
        <summary class="cursor-pointer text-sm font-medium">Editar tarefa</summary>
        <form class="mt-4 grid gap-3" @submit.prevent="save">
          <label class="kb-label"
            >Título<input
              v-model="form.title"
              required
              maxlength="255"
              class="kb-input"
              :disabled="busy" /></label
          ><label class="kb-label"
            >Descrição<textarea
              v-model="form.description"
              rows="3"
              class="kb-input"
              :disabled="busy"
            ></textarea>
          </label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="kb-label"
              >Prioridade<select v-model="form.priority" class="kb-input" :disabled="busy">
                <option v-for="(label, key) in priorityLabels" :key="key" :value="key">
                  {{ label }}
                </option>
              </select></label
            ><label class="kb-label"
              >Entrega<input v-model="form.due_date" type="date" class="kb-input" :disabled="busy"
            /></label>
          </div>
          <label class="kb-label"
            >Responsável<select
              v-model="form.assignee"
              class="kb-input"
              :disabled="busy || loading || !!detailError"
            >
              <option value="">Sem responsável</option>
              <option
                v-if="
                  task.assignee_id && !members.some((member) => member.user_id === task.assignee_id)
                "
                :value="task.assignee_id"
              >
                {{ task.assignee_name }}
              </option>
              <option v-for="member in members" :key="member.user_id" :value="member.user_id">
                {{ member.name }}
              </option>
            </select></label
          ><BaseButton
            class="mt-0!"
            type="submit"
            label="Salvar alterações"
            :loading="saving"
            :disabled="busy || !form.title.trim()"
            :full-width="false"
          />
        </form>
      </details>
      <p v-if="loading" role="status" class="text-xs text-(--kanban-muted)">
        Carregando checklist e comentários…
      </p>
      <div v-else-if="detailError" role="alert" class="kb-error">
        {{ detailError
        }}<button class="ml-2 underline" @click="loadDetails">Tentar novamente</button>
      </div>
      <template v-else>
        <section>
          <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold">
            Checklist
            <span class="font-mono text-[11px] font-normal text-(--kanban-muted)"
              >{{ completed }}/{{ checklist.length }}</span
            >
          </h4>
          <progress
            v-if="checklist.length"
            :value="completed"
            :max="checklist.length"
            class="kb-progress mb-3"
          ></progress>
          <ul class="grid gap-2">
            <li v-for="item in checklist" :key="item.id">
              <label
                class="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1 text-[13px]"
                ><input
                  type="checkbox"
                  :checked="item.is_done"
                  :disabled="pendingItems.has(item.id)"
                  class="mt-1 size-4 shrink-0 accent-(--kanban-text)"
                  @change="toggle(item)"
                /><span :class="{ 'line-through text-(--kanban-muted)': item.is_done }">{{
                  item.content
                }}</span></label
              >
            </li>
          </ul>
          <form class="mt-3 flex gap-2" @submit.prevent="addItem">
            <input
              v-model="newItem"
              aria-label="Novo item do checklist"
              class="kb-input min-w-0 flex-1"
              placeholder="Adicionar item"
              required
              maxlength="255"
              :disabled="writing"
            /><button class="kb-small-button" :disabled="writing || !newItem.trim()">
              Adicionar
            </button>
          </form>
        </section>
        <section>
          <h4 class="mb-3 text-sm font-semibold">
            Comentários
            <span class="ml-1 text-xs font-normal text-(--kanban-muted)">{{
              comments.length
            }}</span>
          </h4>
          <p v-if="!comments.length" class="text-xs text-(--kanban-muted)">
            Inicie a conversa sobre esta tarefa.
          </p>
          <ul class="grid gap-3">
            <li
              v-for="comment in comments"
              :key="comment.id"
              class="rounded-xl border border-(--kanban-border) p-3"
            >
              <div class="flex flex-wrap justify-between gap-1 text-xs">
                <strong>{{ comment.author_name }}</strong
                ><time class="text-(--kanban-muted)" :datetime="comment.created_at">{{
                  formatTaskDate(comment.created_at)
                }}</time>
              </div>
              <p class="mt-1 whitespace-pre-wrap text-[13px] text-(--kanban-secondary)">
                {{ comment.content }}
              </p>
            </li>
          </ul>
          <form class="mt-3 grid gap-2" @submit.prevent="sendComment">
            <textarea
              v-model="newComment"
              aria-label="Escrever comentário"
              class="kb-input"
              placeholder="Escreva um comentário…"
              rows="2"
              required
              :disabled="writing"
            ></textarea
            ><BaseButton
              class="mt-0! justify-self-end"
              type="submit"
              label="Comentar"
              :full-width="false"
              size="sm"
              :loading="writing"
              :disabled="!newComment.trim()"
            />
          </form>
        </section>
      </template>
    </div>
  </KanbanDialog>
</template>
