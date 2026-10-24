<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { BaseButton } from '@/shared/components'
import type { TaskPriority } from '@/shared/types'
import type { CreateTaskRequest, SectorMember, Status } from '../types'
import { avatar } from '../utils/ui'

const props = defineProps<{
  open: boolean
  sectorName: string
  statuses: Status[]
  members: SectorMember[]
  initialStatus: string
  saving: boolean
}>()

const emit = defineEmits<{ close: []; submit: [payload: CreateTaskRequest] }>()

// barras de prioridade como no design (1 a 3); "urgente" usa as 3 em vermelho
const PRIORITIES: { value: TaskPriority; label: string; bars: number; color: string }[] = [
  { value: 'low', label: 'Baixa', bars: 1, color: '#8a857d' },
  { value: 'medium', label: 'Média', bars: 2, color: '#c9720a' },
  { value: 'high', label: 'Alta', bars: 3, color: '#c9720a' },
  { value: 'urgent', label: 'Urgente', bars: 3, color: '#d02b1f' },
]

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const dueDate = ref('')
const status = ref('')
const assignee = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    title.value = ''
    description.value = ''
    priority.value = 'medium'
    dueDate.value = ''
    assignee.value = ''
    status.value = props.initialStatus || props.statuses[0]?.id || ''
    await nextTick()
    titleInput.value?.focus()
  },
)

function submit() {
  if (props.saving || !title.value.trim()) return
  emit('submit', {
    title: title.value.trim(),
    description: description.value,
    priority: priority.value,
    ...(dueDate.value && { due_date: dueDate.value }),
    ...(status.value && { status: status.value }),
    ...(assignee.value && { assignee: assignee.value }),
  })
}

const row = 'flex items-center gap-3 min-h-8'
const label = 'flex w-35 shrink-0 items-center gap-2 text-[13px] text-(--text-muted)'
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
      aria-labelledby="task-drawer-title"
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
        <span class="flex-1 text-[12px] text-(--text-muted)">Nova tarefa</span>
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
            id="task-drawer-title"
            ref="titleInput"
            v-model="title"
            required
            maxlength="255"
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
              <select
                id="task-status"
                v-model="status"
                class="rounded-lg border border-(--border-default) bg-transparent px-2 py-1 text-[13px] dark:border-(--border-inverse)"
              >
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
                    class="grid size-5.5 place-items-center rounded-full bg-(--text-primary) text-[9.5px] font-semibold text-white dark:bg-(--text-inverse) dark:text-(--text-primary)"
                    :style="{ backgroundColor: avatar(member.name).color || undefined }"
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

            <div :class="row">
              <label :class="label" for="task-due"
                ><span class="material-symbols-outlined text-[16px]" aria-hidden="true">flag</span
                >Entrega</label
              >
              <input
                id="task-due"
                v-model="dueDate"
                type="date"
                class="rounded-lg border border-(--border-default) bg-transparent px-2 py-1 text-[13px] dark:border-(--border-inverse)"
              />
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
                  :aria-checked="priority === p.value"
                  class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium"
                  :class="
                    priority === p.value
                      ? 'border-(--text-primary) dark:border-(--text-inverse)'
                      : 'border-(--border-default) text-(--text-secondary) dark:border-(--border-inverse)'
                  "
                  @click="priority = p.value"
                >
                  <span class="flex items-end gap-0.5" aria-hidden="true">
                    <span
                      v-for="n in 3"
                      :key="n"
                      class="w-0.75 rounded-[1px]"
                      :style="{
                        height: `${3 + n * 3}px`,
                        backgroundColor: n <= p.bars ? p.color : '#d3cfc8',
                      }"
                    />
                  </span>
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
              rows="6"
              placeholder="O que precisa ser feito e qual o critério de aceite?"
              class="w-full resize-y rounded-xl border border-(--border-default) bg-transparent p-3 text-[13.5px] leading-5.25 dark:border-(--border-inverse)"
            />
          </div>
        </div>

        <footer
          class="flex justify-end gap-2 border-t border-(--border-default) px-5.5 py-3.5 dark:border-(--border-inverse)"
        >
          <BaseButton label="Cancelar" variant="ghost" :full-width="false" @click="emit('close')" />
          <BaseButton
            label="Criar tarefa"
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
