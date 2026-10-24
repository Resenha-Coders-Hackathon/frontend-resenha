<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getErrorMessage } from '@/app/plugins/axios'
import { fetchTaskOptions } from '@/modules/ai'
import type { AiPerson, AiTask } from '@/modules/ai'
import {
  createChecklistItem,
  createComment,
  deleteChecklistItem,
  deleteComment,
  listChecklist,
  listComments,
  listStatuses,
  moveTask,
  updateChecklistItem,
  updateTask,
} from '@/modules/module'
import type { ChecklistItem, Comment, Status } from '@/modules/module'
import type { TaskPriority } from '@/shared/types'
import ChatAvatar from './chatAvatar.vue'

type Panel = 'edit' | 'priority' | 'due' | 'assignee' | 'status' | 'checklist' | 'comments'

const props = defineProps<{ task: AiTask; disabled?: boolean }>()
// Deletion is the only action that still goes through the chat (server-side confirmation).
const emit = defineEmits<{ delete: [task: AiTask] }>()

// Edits go straight to the API; the card keeps its own copy of the task up to date.
// A just-created task has no counters yet, so default them instead of showing NaN.
const current = ref<AiTask>({
  ...props.task,
  comment_count: props.task.comment_count ?? 0,
  checklist_total: props.task.checklist_total ?? 0,
  checklist_done: props.task.checklist_done ?? 0,
})
const panel = ref<Panel | null>(null)
const busy = ref(false)
const error = ref('')
const statuses = ref<Status[]>([])
const people = ref<AiPerson[]>([])
const checklist = ref<ChecklistItem[]>([])
const comments = ref<Comment[]>([])
const justPosted = ref<string | null>(null)
const draft = ref({ title: '', description: '', due: '', item: '', comment: '' })

const PRIORITY: Record<TaskPriority, { label: string; bars: number; color: string }> = {
  low: { label: 'Baixa', bars: 1, color: 'text-[#2563eb] dark:text-[#8fb1ff]' },
  medium: { label: 'Média', bars: 2, color: 'text-[#d97706] dark:text-[#f5b14c]' },
  high: { label: 'Alta', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
  urgent: { label: 'Urgente', bars: 3, color: 'text-[#dc2626] dark:text-[#ff7b7b]' },
}
const due = computed(() =>
  current.value.due_date
    ? new Date(`${current.value.due_date}T12:00:00`).toLocaleDateString('pt-BR')
    : 'Sem prazo',
)
const column = computed(() => statuses.value.find((s) => s.id === current.value.status_id))
const done = computed(() => !!current.value.completed_at)
const locked = computed(() => busy.value || props.disabled)

async function run<T>(work: () => Promise<T>): Promise<T | undefined> {
  busy.value = true
  error.value = ''
  try {
    return await work()
  } catch (e) {
    error.value = getErrorMessage(e, 'Não foi possível concluir a operação.')
  } finally {
    busy.value = false
  }
}

async function patch(payload: Parameters<typeof updateTask>[1]) {
  const updated = await run(() => updateTask(current.value.id, payload))
  if (updated) current.value = { ...current.value, ...updated }
  return !!updated
}

async function open(next: Panel) {
  panel.value = panel.value === next ? null : next
  error.value = ''
  if (panel.value === 'edit') {
    draft.value.title = current.value.title
    draft.value.description = current.value.description
  } else if (panel.value === 'due') {
    draft.value.due = current.value.due_date ?? ''
  } else if (panel.value === 'assignee' && !people.value.length) {
    people.value = (await run(() => fetchTaskOptions(current.value.sector_id))) ?? []
  } else if (panel.value === 'checklist') {
    checklist.value = (await run(() => listChecklist(current.value.id)))?.results ?? []
  } else if (panel.value === 'comments') {
    comments.value = (await run(() => listComments(current.value.id)))?.results ?? []
  }
}

async function moveTo(statusId: string) {
  if (!statusId || statusId === current.value.status_id) return
  const moved = await run(() => moveTask(current.value.id, { status: statusId }))
  if (moved) current.value = { ...current.value, ...moved }
}

async function toggleDone() {
  const target = statuses.value.find((s) => s.category === (done.value ? 'todo' : 'done'))
  if (target) await moveTo(target.id)
  else error.value = 'Este setor não tem uma coluna de conclusão.'
}

async function addItem() {
  const content = draft.value.item.trim()
  if (!content) return
  const item = await run(() => createChecklistItem(current.value.id, { content }))
  if (!item) return
  checklist.value.push(item)
  draft.value.item = ''
  syncChecklist()
}

async function toggleItem(item: ChecklistItem) {
  const updated = await run(() =>
    updateChecklistItem(current.value.id, item.id, { is_done: !item.is_done }),
  )
  if (updated) item.is_done = updated.is_done
  syncChecklist()
}

async function removeItem(item: ChecklistItem) {
  if ((await run(() => deleteChecklistItem(current.value.id, item.id))) === undefined && error.value)
    return
  checklist.value = checklist.value.filter((i) => i.id !== item.id)
  syncChecklist()
}

function syncChecklist() {
  current.value.checklist_total = checklist.value.length
  current.value.checklist_done = checklist.value.filter((i) => i.is_done).length
}

async function postComment() {
  const content = draft.value.comment.trim()
  if (!content) return
  const comment = await run(() => createComment(current.value.id, content))
  if (!comment) return
  comments.value.push(comment)
  current.value.comment_count += 1
  justPosted.value = comment.id
  draft.value.comment = ''
}

async function undoComment(comment: Comment) {
  await run(() => deleteComment(current.value.id, comment.id))
  if (error.value) return
  comments.value = comments.value.filter((c) => c.id !== comment.id)
  current.value.comment_count = Math.max(0, current.value.comment_count - 1)
  justPosted.value = null
}

onMounted(async () => {
  statuses.value = (await run(() => listStatuses(current.value.sector_id)))?.results ?? []
})

const chip =
  'h-[26px] cursor-pointer rounded-full border px-[10px] text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const idle =
  'border-(--border-default) hover:border-(--chat-ai) hover:text-(--chat-ai) dark:border-(--border-inverse)'
const active = 'border-(--chat-ai) bg-(--chat-ai) text-white'
const field =
  'min-w-0 flex-1 rounded-[8px] border border-(--border-default) bg-transparent px-[10px] py-[5px] text-[12.5px] outline-none focus:border-(--chat-ai) disabled:opacity-60 dark:border-(--border-inverse)'
</script>

<template>
  <div
    class="flex min-w-0 items-start gap-[12px] rounded-[12px] border border-(--border-default) bg-(--surface) px-[12px] py-[12px] dark:border-(--border-inverse) dark:bg-black/20"
  >
    <span
      :class="[
        'material-symbols-outlined text-[20px]!',
        done ? 'text-(--chat-ai)' : 'text-(--text-muted)',
      ]"
      aria-hidden="true"
      >{{ done ? 'task_alt' : 'radio_button_unchecked' }}</span
    >
    <div class="flex min-w-0 flex-1 flex-col gap-[8px] leading-normal">
      <p :class="['text-[13.5px] font-semibold', done ? 'line-through opacity-70' : '']">
        {{ current.title }}
      </p>
      <p
        class="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] text-(--text-muted)"
      >
        <span class="flex items-center gap-[6px]">
          <ChatAvatar :name="current.assignee_name ?? 'Sem responsável'" :size="18" />
          {{ current.assignee_name ?? 'Sem responsável' }}
        </span>
        <span aria-hidden="true">·</span>
        <span class="font-mono text-[11px]">{{ due }}</span>
        <span :class="['flex items-center gap-[4px] font-medium', PRIORITY[current.priority].color]">
          <span class="flex items-end gap-px" aria-hidden="true">
            <span
              v-for="bar in 3"
              :key="bar"
              :class="[
                'w-[3px] rounded-[1px] bg-current',
                bar > PRIORITY[current.priority].bars ? 'opacity-25' : '',
              ]"
              :style="{ height: `${4 + bar * 3}px` }"
            ></span>
          </span>
          {{ PRIORITY[current.priority].label }}
        </span>
        <span v-if="column" class="rounded-full bg-black/5 px-[8px] py-px dark:bg-white/10">{{
          column.name
        }}</span>
      </p>

      <div class="flex flex-wrap gap-[6px]">
        <button type="button" :disabled="locked" :class="[chip, idle]" @click="toggleDone">
          {{ done ? 'Reabrir' : 'Concluir' }}
        </button>
        <button
          v-for="[key, text] in [
            ['edit', 'Editar'],
            ['priority', 'Prioridade'],
            ['due', 'Prazo'],
            ['assignee', 'Responsável'],
            ['status', 'Coluna'],
            ['checklist', `Checklist ${current.checklist_done}/${current.checklist_total}`],
            ['comments', `Comentários ${current.comment_count}`],
          ] as const"
          :key="key"
          type="button"
          :disabled="locked"
          :aria-expanded="panel === key"
          :class="[chip, panel === key ? active : idle]"
          @click="open(key)"
        >
          {{ text }}
        </button>
        <button
          type="button"
          :disabled="locked"
          :class="[chip, idle, 'text-(--destructive)']"
          @click="emit('delete', current)"
        >
          Excluir
        </button>
      </div>

      <div v-if="panel" class="flex flex-col gap-[8px] rounded-[10px] bg-black/3 p-[10px] dark:bg-white/5">
        <template v-if="panel === 'edit'">
          <input v-model="draft.title" maxlength="255" aria-label="Título" :class="field" />
          <textarea
            v-model="draft.description"
            rows="2"
            maxlength="5000"
            aria-label="Descrição"
            placeholder="Descrição"
            :class="field"
          ></textarea>
          <button
            type="button"
            :disabled="locked || !draft.title.trim()"
            :class="[chip, active, 'w-fit']"
            @click="patch({ title: draft.title.trim(), description: draft.description }).then((ok) => ok && (panel = null))"
          >
            Salvar
          </button>
        </template>

        <div v-else-if="panel === 'priority'" class="flex gap-[6px]" role="radiogroup" aria-label="Prioridade">
          <button
            v-for="[value, text] in [['low', 'Baixa'], ['medium', 'Média'], ['high', 'Alta'], ['urgent', 'Urgente']] as const"
            :key="value"
            type="button"
            role="radio"
            :aria-checked="current.priority === value"
            :disabled="locked"
            :class="[chip, current.priority === value ? active : idle]"
            @click="patch({ priority: value })"
          >
            {{ text }}
          </button>
        </div>

        <div v-else-if="panel === 'due'" class="flex flex-wrap items-center gap-[6px]">
          <input v-model="draft.due" type="date" aria-label="Prazo" :disabled="locked" :class="[field, 'flex-none']" />
          <button type="button" :disabled="locked || !draft.due" :class="[chip, active]" @click="patch({ due_date: draft.due })">
            Salvar prazo
          </button>
          <button type="button" :disabled="locked || !current.due_date" :class="[chip, idle]" @click="patch({ due_date: null }).then(() => (draft.due = ''))">
            Remover prazo
          </button>
        </div>

        <div v-else-if="panel === 'assignee'" class="flex flex-wrap items-center gap-[6px]">
          <select
            :value="current.assignee_id ?? ''"
            :disabled="locked"
            aria-label="Responsável"
            :class="[field, 'flex-none']"
            @change="
              (e) =>
                patch({
                  assignee: (e.target as HTMLSelectElement).value || null,
                }).then(() => {
                  current.assignee_name =
                    people.find((p) => p.id === current.assignee_id)?.name ?? null
                })
            "
          >
            <option value="">Sem responsável</option>
            <option v-for="person in people" :key="person.id" :value="person.id">
              {{ person.name }}
            </option>
          </select>
        </div>

        <div v-else-if="panel === 'status'" class="flex flex-wrap gap-[6px]" role="radiogroup" aria-label="Coluna">
          <button
            v-for="status in statuses"
            :key="status.id"
            type="button"
            role="radio"
            :aria-checked="status.id === current.status_id"
            :disabled="locked"
            :class="[chip, status.id === current.status_id ? active : idle]"
            @click="moveTo(status.id)"
          >
            {{ status.name }}
          </button>
        </div>

        <template v-else-if="panel === 'checklist'">
          <label v-for="item in checklist" :key="item.id" class="flex items-center gap-[8px] text-[12.5px]">
            <input type="checkbox" :checked="item.is_done" :disabled="locked" @change="toggleItem(item)" />
            <span :class="['min-w-0 flex-1 break-words', item.is_done ? 'line-through opacity-60' : '']">{{ item.content }}</span>
            <button type="button" :disabled="locked" :aria-label="`Remover ${item.content}`" class="cursor-pointer text-(--text-muted) hover:text-(--destructive)" @click.prevent="removeItem(item)">×</button>
          </label>
          <p v-if="!checklist.length" class="text-[12px] text-(--text-muted)">Nenhum item ainda.</p>
          <form class="flex gap-[6px]" @submit.prevent="addItem">
            <input v-model="draft.item" maxlength="255" placeholder="Novo item" aria-label="Novo item do checklist" :disabled="locked" :class="field" />
            <button type="submit" :disabled="locked || !draft.item.trim()" :class="[chip, active]">Adicionar</button>
          </form>
        </template>

        <template v-else-if="panel === 'comments'">
          <div v-for="comment in comments" :key="comment.id" class="flex flex-col gap-[2px] text-[12.5px]">
            <p class="text-[11.5px] text-(--text-muted)">
              {{ comment.author_name }} · {{ new Date(comment.created_at).toLocaleString('pt-BR') }}
              <button v-if="comment.id === justPosted" type="button" :disabled="locked" class="ml-[6px] cursor-pointer text-(--chat-ai) underline" @click="undoComment(comment)">Desfazer</button>
            </p>
            <p class="whitespace-pre-wrap break-words">{{ comment.content }}</p>
          </div>
          <p v-if="!comments.length" class="text-[12px] text-(--text-muted)">Nenhum comentário ainda.</p>
          <form class="flex gap-[6px]" @submit.prevent="postComment">
            <input v-model="draft.comment" maxlength="5000" placeholder="Escreva um comentário" aria-label="Novo comentário" :disabled="locked" :class="field" />
            <button type="submit" :disabled="locked || !draft.comment.trim()" :class="[chip, active]">Publicar</button>
          </form>
        </template>
      </div>

      <p v-if="error" role="alert" class="text-[12px] text-(--destructive)">{{ error }}</p>
      <p class="break-all font-mono text-[10px] text-(--text-muted)" :title="current.id">
        ID: {{ current.id }}
      </p>
    </div>
  </div>
</template>
