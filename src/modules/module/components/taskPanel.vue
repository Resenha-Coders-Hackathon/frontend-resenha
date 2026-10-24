<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { TaskCharges } from '@/modules/payments'
import { uploadFile } from '@/modules/uploads'
import { fetchAllPages } from '@/shared/utils'
import { avatar } from '@/shared/utils/people'
import { relativeTime } from '@/shared/utils/time'
import type { DriveTaskLink } from '@/modules/calendar_sync'
import { useLinksStore } from '../stores/links'
import { LINK_ORIGINS, dueLabel, linkOrigin, type LinkOrigin } from '../utils/board'
import type { TaskPriority } from '@/shared/types'
import {
  createChecklistItem,
  createComment,
  deleteChecklistItem,
  deleteComment,
  listChecklist,
  listComments,
  updateChecklistItem,
} from '../services'
import type {
  ChecklistItem,
  Comment,
  CreateTaskRequest,
  SectorMember,
  Status,
  Task,
} from '../types'
import { PRIORITIES } from './priority'
import PriorityBars from './priorityBars.vue'
import TaskGoogle from './taskGoogle.vue'

/* Painel lateral: sem `task` cria uma tarefa; com `task` mostra e edita os detalhes. */
const props = defineProps<{
  open: boolean
  sectorName: string
  statuses: Status[]
  members: SectorMember[]
  task: Task | null
  initialStatus: string
  canEdit: boolean
  canManage: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [payload: CreateTaskRequest]
  save: [id: string, payload: CreateTaskRequest]
  remove: [id: string]
  changed: [id: string]
}>()

const auth = useAuthStore()
const linksStore = useLinksStore()
const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const dueDate = ref('')
const status = ref('')
const assignee = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const checklist = ref<ChecklistItem[]>([])
const comments = ref<Comment[]>([])
const newItem = ref('')
const newComment = ref('')
const linkUrl = ref('')
const linkTitle = ref('')
const linkHint = ref<LinkOrigin | null>(null)
const linkUrlInput = ref<HTMLInputElement | null>(null)

const editing = computed(() => !!props.task)
const readOnly = computed(() => editing.value && !props.canEdit)

watch(
  () => [props.open, props.task?.id] as const,
  async ([open]) => {
    if (!open) return
    const t = props.task
    title.value = t?.title ?? ''
    description.value = t?.description ?? ''
    priority.value = t?.priority ?? 'medium'
    dueDate.value = t?.due_date ?? ''
    assignee.value = t?.assignee_id ?? ''
    status.value = t?.status_id ?? (props.initialStatus || props.statuses[0]?.id || '')
    checklist.value = []
    comments.value = []
    newItem.value = newComment.value = linkUrl.value = linkTitle.value = ''
    linkHint.value = null
    await nextTick()
    if (!t) titleInput.value?.focus()
    if (t) await loadDetails(t.id)
  },
  { immediate: true },
)

async function loadDetails(id: string) {
  try {
    const [items, notes] = await Promise.all([
      fetchAllPages((page) => listChecklist(id, page)),
      fetchAllPages((page) => listComments(id, page)),
      linksStore.load('task', id),
    ])
    if (props.task?.id !== id) return
    checklist.value = items
    comments.value = notes
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível carregar os detalhes da tarefa.'))
  }
}

function submit() {
  if (props.saving || !title.value.trim() || readOnly.value) return
  const payload: CreateTaskRequest = {
    title: title.value.trim(),
    description: description.value,
    priority: priority.value,
    due_date: dueDate.value || null,
    assignee: assignee.value || null,
    ...(status.value && { status: status.value }),
  }
  if (props.task) emit('save', props.task.id, payload)
  else emit('create', payload)
}

// mudanças no checklist e nos comentários valem na hora (não esperam o "Salvar")
async function run(action: () => Promise<void>, failure: string) {
  try {
    await action()
    if (props.task) emit('changed', props.task.id)
  } catch (error) {
    toast.error(getErrorMessage(error, failure))
  }
}

const addItem = () =>
  run(async () => {
    const content = newItem.value.trim()
    if (!props.task || !content) return
    checklist.value = [...checklist.value, await createChecklistItem(props.task.id, { content })]
    newItem.value = ''
  }, 'Não foi possível adicionar o item.')

const toggleItem = (item: ChecklistItem) =>
  run(async () => {
    if (!props.task) return
    const updated = await updateChecklistItem(props.task.id, item.id, { is_done: !item.is_done })
    checklist.value = checklist.value.map((i) => (i.id === item.id ? updated : i))
  }, 'Não foi possível atualizar o item.')

const removeItem = (item: ChecklistItem) =>
  run(async () => {
    if (!props.task) return
    await deleteChecklistItem(props.task.id, item.id)
    checklist.value = checklist.value.filter((i) => i.id !== item.id)
  }, 'Não foi possível remover o item.')

const addComment = () =>
  run(async () => {
    const content = newComment.value.trim()
    if (!props.task || !content) return
    comments.value = [...comments.value, await createComment(props.task.id, content)]
    newComment.value = ''
  }, 'Não foi possível comentar.')

const removeComment = (comment: Comment) =>
  run(async () => {
    if (!props.task) return
    await deleteComment(props.task.id, comment.id)
    comments.value = comments.value.filter((c) => c.id !== comment.id)
  }, 'Não foi possível apagar o comentário.')

const links = computed(() => (props.task ? linksStore.forTarget('task', props.task.id) : []))

function pickOrigin(origin: LinkOrigin) {
  linkHint.value = origin
  linkUrlInput.value?.focus()
}

const addLink = () =>
  run(async () => {
    const url = linkUrl.value.trim()
    if (!props.task || !url) return
    await linksStore.add('task', props.task.id, {
      url,
      ...(linkTitle.value.trim() && { title: linkTitle.value.trim() }),
    })
    linkUrl.value = linkTitle.value = ''
    linkHint.value = null
  }, 'Não foi possível anexar o link. Confira se o endereço começa com https://.')

const fileInput = ref<HTMLInputElement | null>(null)

// Envia o arquivo (Cloudinary) e o registra como anexo da tarefa.
function uploadAttachment(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  void run(async () => {
    if (!props.task) return
    const { url } = await uploadFile(file)
    await linksStore.add('task', props.task.id, { url, title: file.name.slice(0, 255) })
  }, 'Não foi possível enviar o arquivo.')
}

function onAttached(link: DriveTaskLink) {
  if (!props.task) return
  linksStore.put('task', props.task.id, link)
  emit('changed', props.task.id)
}

const removeLink = (id: string) =>
  run(async () => {
    if (props.task) await linksStore.remove('task', props.task.id, id)
  }, 'Não foi possível remover o anexo.')

const currentStatus = computed(() => props.statuses.find((s) => s.id === status.value))
const created = computed(() =>
  props.task
    ? new Date(props.task.created_at)
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace('.', '')
    : '',
)
const deadline = computed(() =>
  props.task
    ? dueLabel({ due_date: dueDate.value || null, completed_at: props.task.completed_at })
    : '',
)
const done = computed(() => checklist.value.filter((i) => i.is_done).length)
const canDeleteComment = (c: Comment) => props.canManage || c.author_id === auth.user?.id

const row = 'flex items-center gap-3 min-h-8'
const label = 'flex w-35 shrink-0 items-center gap-2 text-[13px] text-(--text-muted)'
const field =
  'rounded-lg border border-(--border-default) bg-transparent px-2 py-1 text-[13px] disabled:opacity-70 dark:border-(--border-inverse)'
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/30"
      aria-hidden="true"
      @click="emit('close')"
    />
  </Transition>
  <Transition
    enter-active-class="transition-transform duration-250 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-panel-title"
      class="fixed top-0 right-0 z-50 flex h-dvh w-[min(640px,100vw)] flex-col border-l border-(--border-default) bg-(--surface) text-(--text-primary) shadow-[0_24px_60px_-20px_rgba(20,20,18,0.28)] dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
      @keydown.esc="emit('close')"
    >
      <header
        class="flex items-center gap-2 border-b border-(--border-default) px-5.5 py-3.5 dark:border-(--border-inverse)"
      >
        <span
          class="rounded-md bg-(--bg-muted) px-2 py-0.5 text-[11px] text-(--text-secondary) dark:bg-white/10"
          >{{ sectorName }}</span
        >
        <span class="flex-1 text-[12px] text-(--text-muted)">{{
          editing ? 'Detalhes da tarefa' : 'Nova tarefa'
        }}</span>
        <button
          v-if="editing && canManage"
          type="button"
          class="grid size-9 place-items-center rounded-[10px] border border-(--border-default) text-[#c42b2b] hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
          aria-label="Excluir tarefa"
          @click="task && emit('remove', task.id)"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
        </button>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-[10px] border border-(--border-default) hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
          aria-label="Fechar"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
        </button>
      </header>

      <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="submit">
        <div class="flex min-h-0 flex-1 flex-col gap-5.5 overflow-y-auto p-5.5">
          <input
            id="task-panel-title"
            ref="titleInput"
            v-model="title"
            required
            maxlength="255"
            :readonly="readOnly"
            placeholder="Título da tarefa"
            aria-label="Título da tarefa"
            class="w-full bg-transparent text-[22px] leading-7 font-semibold tracking-[-0.02em] outline-none placeholder:text-(--text-muted)"
          />

          <div class="grid gap-2.5">
            <div :class="row">
              <label :class="label" for="task-status"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true"
                  >timelapse</span
                >Status</label
              >
              <span
                class="size-2.5 rounded-full"
                :style="{ backgroundColor: currentStatus?.color || '#8a857d' }"
                aria-hidden="true"
              />
              <select id="task-status" v-model="status" :disabled="readOnly" :class="field">
                <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div :class="[row, 'items-start']">
              <span :class="[label, 'pt-1.5']"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true">person</span
                >Responsável</span
              >
              <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Responsável">
                <button
                  v-for="member in members"
                  :key="member.user_id"
                  type="button"
                  role="radio"
                  :disabled="readOnly"
                  :aria-checked="assignee === member.user_id"
                  class="flex items-center gap-1.5 rounded-full border py-0.75 pr-2.5 pl-1 text-[13px] font-medium"
                  :class="
                    assignee === member.user_id
                      ? 'border-(--bg-orange) bg-(--bg-orange)/10'
                      : 'border-(--border-default) hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10'
                  "
                  @click="assignee = assignee === member.user_id ? '' : member.user_id"
                >
                  <span
                    class="grid size-5.5 place-items-center rounded-full text-[9.5px] font-semibold text-white"
                    :style="{ backgroundColor: avatar(member.name).color }"
                    aria-hidden="true"
                    >{{ avatar(member.name).initials }}</span
                  >
                  {{ member.name }}
                </button>
                <p v-if="!members.length" class="py-1 text-[13px] text-(--text-muted)">
                  Ninguém com acesso a este setor ainda.
                </p>
              </div>
            </div>

            <div v-if="task" :class="row">
              <span :class="label"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true">event</span
                >Criada em</span
              >
              <span class="text-[13px]"
                >{{ created
                }}<template v-if="task.created_by_name">
                  · por {{ task.created_by_name }}</template
                ></span
              >
            </div>

            <div :class="row">
              <label :class="label" for="task-due"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true">flag</span
                >Entrega</label
              >
              <input
                id="task-due"
                v-model="dueDate"
                type="date"
                :disabled="readOnly"
                :class="field"
              />
              <span
                v-if="deadline"
                :class="[
                  'rounded-md px-2 py-0.5 text-[12px] font-medium',
                  task?.is_overdue
                    ? 'bg-[#fde8e8] text-[#c42b2b] dark:bg-[#dc2626]/20 dark:text-[#ff8a8a]'
                    : 'bg-(--bg-muted) text-(--text-secondary) dark:bg-white/10',
                ]"
                >{{ deadline }}</span
              >
            </div>

            <div :class="row">
              <span :class="label"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true">layers</span
                >Prioridade</span
              >
              <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Prioridade">
                <button
                  v-for="p in PRIORITIES"
                  :key="p.value"
                  type="button"
                  role="radio"
                  :disabled="readOnly"
                  :aria-checked="priority === p.value"
                  class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium"
                  :class="
                    priority === p.value
                      ? 'border-(--text-primary) dark:border-(--text-inverse)'
                      : 'border-(--border-default) text-(--text-secondary) dark:border-(--border-inverse)'
                  "
                  @click="priority = p.value"
                >
                  <PriorityBars :priority="p.value" />
                  {{ p.label }}
                </button>
              </div>
            </div>

            <div :class="row">
              <span :class="label"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true"
                  >apartment</span
                >Setor</span
              >
              <span class="text-[13px] font-medium">{{ sectorName }}</span>
            </div>
          </div>

          <div class="grid gap-2.5">
            <label for="task-description" class="text-[14px] font-semibold">Descrição</label>
            <textarea
              id="task-description"
              v-model="description"
              rows="5"
              :readonly="readOnly"
              placeholder="O que precisa ser feito e qual o critério de aceite?"
              class="w-full resize-y rounded-xl border border-(--border-default) bg-transparent p-3 text-[13.5px] leading-5.25 dark:border-(--border-inverse)"
            />
          </div>

          <section v-if="editing" class="grid gap-2.5" aria-labelledby="task-checklist">
            <h3 id="task-checklist" class="text-[14px] font-semibold">
              Checklist
              <span v-if="checklist.length" class="font-normal text-(--text-muted)"
                >· {{ done }}/{{ checklist.length }}</span
              >
            </h3>
            <ul class="grid gap-1">
              <li v-for="item in checklist" :key="item.id" class="group flex items-center gap-2.5">
                <input
                  type="checkbox"
                  class="size-4 accent-(--bg-orange)"
                  :checked="item.is_done"
                  :disabled="!canEdit"
                  :aria-label="item.content"
                  @change="toggleItem(item)"
                />
                <span
                  :class="[
                    'flex-1 text-[13.5px]',
                    item.is_done && 'text-(--text-muted) line-through',
                  ]"
                  >{{ item.content }}</span
                >
                <button
                  v-if="canEdit"
                  type="button"
                  class="material-symbols-outlined text-[18px]! text-(--text-muted) opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  :aria-label="`Remover ${item.content}`"
                  @click="removeItem(item)"
                >
                  close
                </button>
              </li>
            </ul>
            <form v-if="canEdit" class="flex gap-2" @submit.prevent="addItem">
              <input
                v-model="newItem"
                maxlength="255"
                placeholder="Adicionar item"
                aria-label="Novo item do checklist"
                :class="[field, 'h-9 flex-1']"
              />
              <BaseButton
                label="Adicionar"
                variant="ghost"
                size="sm"
                :full-width="false"
                type="submit"
                :disabled="!newItem.trim()"
              />
            </form>
          </section>

          <section v-if="editing" class="grid gap-2.5" aria-labelledby="task-links">
            <h3 id="task-links" class="text-[14px] font-semibold">
              Anexos e integrações
              <span v-if="links.length" class="font-normal text-(--text-muted)"
                >· {{ links.length }}</span
              >
            </h3>
            <TaskGoogle
              v-if="task"
              :task-id="task.id"
              :due-date="dueDate"
              :can-edit="canEdit"
              @attached="onAttached"
            />
            <TaskCharges v-if="task" :task-id="task.id" :can-edit="canEdit" />
            <div v-if="canEdit" class="grid grid-cols-3 gap-2">
              <button
                v-for="origin in ['drive', 'docs', 'meet'] as const"
                :key="origin"
                type="button"
                :class="[
                  'flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-[13px] font-medium transition-colors',
                  linkHint === origin
                    ? 'border-(--text-primary) dark:border-(--text-inverse)'
                    : 'border-(--border-default) hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10',
                ]"
                @click="pickOrigin(origin)"
              >
                <span
                  class="material-symbols-outlined grid size-8 place-items-center rounded-lg text-[18px]!"
                  :style="{
                    backgroundColor: `${LINK_ORIGINS[origin].color}1f`,
                    color: LINK_ORIGINS[origin].color,
                  }"
                  aria-hidden="true"
                  >{{ LINK_ORIGINS[origin].icon }}</span
                >
                {{ LINK_ORIGINS[origin].label }}
              </button>
            </div>
            <ul class="grid gap-2">
              <li
                v-for="link in links"
                :key="link.id"
                class="group flex items-center gap-3 rounded-xl border border-(--border-default) p-3 dark:border-(--border-inverse)"
              >
                <span
                  class="material-symbols-outlined grid size-8 shrink-0 place-items-center rounded-lg text-[18px]!"
                  :style="{
                    backgroundColor: `${LINK_ORIGINS[linkOrigin(link.url)].color}1f`,
                    color: LINK_ORIGINS[linkOrigin(link.url)].color,
                  }"
                  aria-hidden="true"
                  >{{ LINK_ORIGINS[linkOrigin(link.url)].icon }}</span
                >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13.5px] font-medium">{{
                    link.title || link.url
                  }}</span>
                  <span class="block truncate text-[12px] text-(--text-muted)">{{
                    LINK_ORIGINS[linkOrigin(link.url)].label
                  }}</span>
                </span>
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="material-symbols-outlined text-[18px]! text-(--text-muted) hover:text-(--text-primary)"
                  :aria-label="`Abrir ${link.title || link.url}`"
                  >open_in_new</a
                >
                <button
                  v-if="canEdit"
                  type="button"
                  class="material-symbols-outlined text-[18px]! text-(--text-muted) opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Remover anexo"
                  @click="removeLink(link.id)"
                >
                  close
                </button>
              </li>
              <li v-if="!links.length" class="text-[13px] text-(--text-muted)">
                Nenhum anexo ainda.
              </li>
            </ul>
            <div v-if="canEdit">
              <input
                ref="fileInput"
                type="file"
                class="sr-only"
                tabindex="-1"
                aria-label="Arquivo para anexar"
                @change="uploadAttachment"
              />
              <BaseButton
                label="Enviar arquivo do computador"
                icon="attach_file"
                icon-position="left"
                variant="ghost"
                size="sm"
                :full-width="false"
                @click="fileInput?.click()"
              />
            </div>
            <form v-if="canEdit" class="flex flex-wrap gap-2" @submit.prevent="addLink">
              <input
                ref="linkUrlInput"
                v-model="linkUrl"
                type="url"
                :placeholder="
                  linkHint
                    ? `Cole o link do ${LINK_ORIGINS[linkHint].label}`
                    : 'Cole um link (https://…)'
                "
                aria-label="Endereço do anexo"
                :class="[field, 'h-9 min-w-48 flex-[2]']"
              />
              <input
                v-model="linkTitle"
                maxlength="255"
                placeholder="Nome (opcional)"
                aria-label="Nome do anexo"
                :class="[field, 'h-9 min-w-32 flex-1']"
              />
              <BaseButton
                label="Anexar"
                variant="ghost"
                size="sm"
                :full-width="false"
                type="submit"
                :disabled="!linkUrl.trim()"
              />
            </form>
          </section>

          <section v-if="editing" class="grid gap-2.5" aria-labelledby="task-comments">
            <h3 id="task-comments" class="text-[14px] font-semibold">
              Comentários
              <span v-if="comments.length" class="font-normal text-(--text-muted)"
                >· {{ comments.length }}</span
              >
            </h3>
            <ul class="grid gap-3">
              <li v-for="c in comments" :key="c.id" class="group flex gap-2.5">
                <span
                  class="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                  :style="{ backgroundColor: avatar(c.author_name).color }"
                  aria-hidden="true"
                  >{{ avatar(c.author_name).initials }}</span
                >
                <div class="min-w-0 flex-1">
                  <p class="text-[12.5px]">
                    <strong>{{ c.author_name }}</strong>
                    <span class="text-(--text-muted)"> · {{ relativeTime(c.created_at) }}</span>
                  </p>
                  <p class="text-[13.5px] break-words whitespace-pre-line">{{ c.content }}</p>
                </div>
                <button
                  v-if="canDeleteComment(c)"
                  type="button"
                  class="material-symbols-outlined self-start text-[18px]! text-(--text-muted) opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Apagar comentário"
                  @click="removeComment(c)"
                >
                  delete
                </button>
              </li>
              <li v-if="!comments.length" class="text-[13px] text-(--text-muted)">
                Nenhum comentário ainda.
              </li>
            </ul>
            <form class="flex gap-2" @submit.prevent="addComment">
              <input
                v-model="newComment"
                maxlength="2000"
                placeholder="Escreva um comentário"
                aria-label="Novo comentário"
                :class="[field, 'h-9 flex-1']"
              />
              <BaseButton
                label="Comentar"
                variant="ghost"
                size="sm"
                :full-width="false"
                type="submit"
                :disabled="!newComment.trim()"
              />
            </form>
          </section>
        </div>

        <footer
          class="flex justify-end gap-2 border-t border-(--border-default) px-5.5 py-3.5 dark:border-(--border-inverse)"
        >
          <BaseButton
            :label="readOnly ? 'Fechar' : 'Cancelar'"
            variant="ghost"
            :full-width="false"
            @click="emit('close')"
          />
          <BaseButton
            v-if="!readOnly"
            :label="editing ? 'Salvar alterações' : 'Criar tarefa'"
            type="submit"
            :full-width="false"
            :loading="saving"
            :disabled="!title.trim()"
          />
        </footer>
      </form>
    </aside>
  </Transition>
</template>
